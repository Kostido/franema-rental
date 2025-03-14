import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, handleApiError, notFoundResponse, validationErrorResponse, forbiddenResponse } from '@/lib/api/api-response';
import { withAuth } from '@/lib/api/auth-helpers';
import { BookingStatus } from '@/types/supabase';

/**
 * GET /api/bookings/[id]
 * Получение информации о конкретном бронировании
 */
export const GET = withAuth(async (
    req: NextRequest,
    user
) => {
    try {
        // Извлекаем id из URL
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop();

        if (!id) {
            return notFoundResponse('Бронирование');
        }

        const supabase = await createServerSupabaseClient();

        // Получаем бронирование по ID
        const { data, error } = await supabase
            .from('bookings')
            .select(`
        *,
        equipment:equipment_id (id, name, category, image_url, description),
        user:user_id (id, full_name, email)
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return notFoundResponse('Бронирование');
            }
            throw error;
        }

        // Проверяем, имеет ли пользователь доступ к этому бронированию
        const isAdminOrManager = user.role === 'ADMIN' || user.role === 'MANAGER';
        if (!isAdminOrManager && data.user_id !== user.id) {
            return forbiddenResponse();
        }

        return successResponse(data);
    } catch (error) {
        return handleApiError(error);
    }
});

/**
 * PATCH /api/bookings/[id]
 * Обновление информации о бронировании
 * Пользователи могут обновлять только свои бронирования и только определенные поля
 * Администраторы и менеджеры могут обновлять все бронирования и все поля
 */
export const PATCH = withAuth(async (
    req: NextRequest,
    user
) => {
    try {
        // Извлекаем id из URL
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop();

        if (!id) {
            return notFoundResponse('Бронирование');
        }

        const body = await req.json();

        const supabase = await createServerSupabaseClient();

        // Получаем текущее бронирование
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (bookingError) {
            if (bookingError.code === 'PGRST116') {
                return notFoundResponse('Бронирование');
            }
            throw bookingError;
        }

        // Проверяем, имеет ли пользователь доступ к этому бронированию
        const isAdminOrManager = user.role === 'ADMIN' || user.role === 'MANAGER';
        if (!isAdminOrManager && booking.user_id !== user.id) {
            return forbiddenResponse();
        }

        // Обычные пользователи могут обновлять только определенные поля и только если бронирование в статусе PENDING
        if (!isAdminOrManager) {
            // Пользователи могут обновлять только свои бронирования в статусе PENDING или отменять их
            if (booking.status !== 'PENDING' && body.status !== 'CANCELLED') {
                return validationErrorResponse('Вы можете изменять только бронирования в статусе "Ожидает подтверждения" или отменять их');
            }

            // Пользователи могут обновлять только определенные поля
            const allowedFields = ['start_date', 'end_date', 'notes', 'status'];
            const updatedFields = Object.keys(body);

            for (const field of updatedFields) {
                if (!allowedFields.includes(field)) {
                    return validationErrorResponse(`Вы не можете изменять поле "${field}"`);
                }
            }

            // Пользователи могут только отменять бронирования, но не менять статус на другой
            if (body.status && body.status !== 'CANCELLED') {
                return validationErrorResponse('Вы можете только отменить бронирование');
            }
        }

        // Проверяем, что статус допустим, если он указан
        if (body.status) {
            const validStatuses: BookingStatus[] = [
                'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'
            ];

            if (!validStatuses.includes(body.status)) {
                return validationErrorResponse(`Статус должен быть одним из: ${validStatuses.join(', ')}`);
            }
        }

        // Если изменяются даты, проверяем их валидность
        if (body.start_date || body.end_date) {
            const startDate = new Date(body.start_date || booking.start_date);
            const endDate = new Date(body.end_date || booking.end_date);
            const now = new Date();

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return validationErrorResponse('Некорректный формат даты');
            }

            if (startDate < now) {
                return validationErrorResponse('Дата начала бронирования не может быть в прошлом');
            }

            if (endDate <= startDate) {
                return validationErrorResponse('Дата окончания должна быть позже даты начала');
            }

            // Проверяем доступность оборудования на новые даты
            if (body.start_date || body.end_date) {
                const { data: isAvailable, error: availabilityError } = await supabase
                    .rpc('check_equipment_availability', {
                        equipment_id: booking.equipment_id,
                        start_date: body.start_date || booking.start_date,
                        end_date: body.end_date || booking.end_date,
                        exclude_booking_id: id,
                    });

                if (availabilityError) {
                    throw availabilityError;
                }

                if (!isAvailable) {
                    return validationErrorResponse('Оборудование недоступно на указанные даты');
                }
            }
        }

        // Обновляем бронирование
        const { data, error } = await supabase
            .from('bookings')
            .update(body)
            .eq('id', id)
            .select(`
        *,
        equipment:equipment_id (id, name, category, image_url),
        user:user_id (id, full_name, email)
      `)
            .single();

        if (error) {
            throw error;
        }

        return successResponse(data);
    } catch (error) {
        return handleApiError(error);
    }
});

/**
 * DELETE /api/bookings/[id]
 * Удаление бронирования
 * Пользователи могут удалять только свои бронирования в статусе PENDING
 * Администраторы и менеджеры могут удалять любые бронирования
 */
export const DELETE = withAuth(async (
    req: NextRequest,
    user
) => {
    try {
        // Извлекаем id из URL
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop();

        if (!id) {
            return notFoundResponse('Бронирование');
        }

        const supabase = await createServerSupabaseClient();

        // Получаем текущее бронирование
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (bookingError) {
            if (bookingError.code === 'PGRST116') {
                return notFoundResponse('Бронирование');
            }
            throw bookingError;
        }

        // Проверяем, имеет ли пользователь доступ к этому бронированию
        const isAdminOrManager = user.role === 'ADMIN' || user.role === 'MANAGER';
        if (!isAdminOrManager && booking.user_id !== user.id) {
            return forbiddenResponse();
        }

        // Обычные пользователи могут удалять только свои бронирования в статусе PENDING
        if (!isAdminOrManager && booking.status !== 'PENDING') {
            return validationErrorResponse('Вы можете удалять только бронирования в статусе "Ожидает подтверждения"');
        }

        // Удаляем бронирование
        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return successResponse({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}); 