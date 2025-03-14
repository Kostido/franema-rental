import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, handleApiError, validationErrorResponse } from '@/lib/api/api-response';
import { withAuth, withAdminOrManager } from '@/lib/api/auth-helpers';
import { BookingStatus } from '@/types/supabase';

/**
 * GET /api/bookings
 * Получение списка бронирований с возможностью фильтрации
 * Обычные пользователи видят только свои бронирования
 * Администраторы и менеджеры видят все бронирования
 */
export const GET = withAuth(async (req: NextRequest, user) => {
    try {
        const searchParams = req.nextUrl.searchParams;
        const status = searchParams.get('status') as BookingStatus | null;
        const equipmentId = searchParams.get('equipment_id');
        const userId = searchParams.get('user_id');
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const supabase = createServerSupabaseClient();

        // Определяем, является ли пользователь администратором или менеджером
        const isAdminOrManager = user.role === 'ADMIN' || user.role === 'MANAGER';

        let query = supabase
            .from('bookings')
            .select(`
        *,
        equipment:equipment_id (id, name, category, image_url),
        user:user_id (id, full_name, email)
      `, { count: 'exact' });

        // Обычные пользователи видят только свои бронирования
        if (!isAdminOrManager) {
            query = query.eq('user_id', user.id);
        }
        // Администраторы и менеджеры могут фильтровать по пользователю
        else if (userId) {
            query = query.eq('user_id', userId);
        }

        // Применяем фильтры, если они указаны
        if (status) {
            query = query.eq('status', status);
        }

        if (equipmentId) {
            query = query.eq('equipment_id', equipmentId);
        }

        if (from) {
            query = query.gte('start_date', from);
        }

        if (to) {
            query = query.lte('end_date', to);
        }

        // Добавляем сортировку и пагинацию
        query = query
            .order('start_date', { ascending: true })
            .range(offset, offset + limit - 1);

        const { data, count, error } = await query;

        if (error) {
            throw error;
        }

        return successResponse({
            items: data,
            total: count || 0,
            limit,
            offset,
        });
    } catch (error) {
        return handleApiError(error);
    }
});

/**
 * POST /api/bookings
 * Создание нового бронирования
 */
export const POST = withAuth(async (req: NextRequest, user) => {
    try {
        const body = await req.json();

        // Проверяем обязательные поля
        const { equipment_id, start_date, end_date } = body;

        if (!equipment_id || !start_date || !end_date) {
            return validationErrorResponse('Необходимо указать equipment_id, start_date и end_date');
        }

        // Проверяем, что даты валидны
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
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

        const supabase = createServerSupabaseClient();

        // Проверяем, существует ли оборудование
        const { data: equipment, error: equipmentError } = await supabase
            .from('equipment')
            .select('id, is_available')
            .eq('id', equipment_id)
            .single();

        if (equipmentError || !equipment) {
            return validationErrorResponse('Указанное оборудование не найдено');
        }

        if (!equipment.is_available) {
            return validationErrorResponse('Указанное оборудование недоступно для бронирования');
        }

        // Проверяем доступность оборудования на указанные даты
        const { data: isAvailable, error: availabilityError } = await supabase
            .rpc('check_equipment_availability', {
                equipment_id,
                start_date,
                end_date,
            });

        if (availabilityError) {
            throw availabilityError;
        }

        if (!isAvailable) {
            return validationErrorResponse('Оборудование недоступно на указанные даты');
        }

        // Создаем новое бронирование
        const { data, error } = await supabase
            .from('bookings')
            .insert({
                ...body,
                user_id: user.id,
                status: 'PENDING',
            })
            .select(`
        *,
        equipment:equipment_id (id, name, category, image_url)
      `)
            .single();

        if (error) {
            throw error;
        }

        return successResponse(data, 201);
    } catch (error) {
        return handleApiError(error);
    }
}); 