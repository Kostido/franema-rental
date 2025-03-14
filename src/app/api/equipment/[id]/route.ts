import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, handleApiError, notFoundResponse, validationErrorResponse } from '@/lib/api/api-response';
import { withAdminOrManager } from '@/lib/api/auth-helpers';
import { EquipmentCategory } from '@/types/supabase';

/**
 * GET /api/equipment/[id]
 * Получение информации о конкретном оборудовании
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const supabase = createServerSupabaseClient();

        // Получаем оборудование по ID
        const { data, error } = await supabase
            .from('equipment')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return notFoundResponse('Оборудование');
            }
            throw error;
        }

        // Получаем текущие бронирования для этого оборудования
        const { data: bookings } = await supabase
            .from('bookings')
            .select('id, start_date, end_date, status')
            .eq('equipment_id', id)
            .in('status', ['PENDING', 'APPROVED'])
            .order('start_date', { ascending: true });

        return successResponse({
            ...data,
            bookings: bookings || [],
        });
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * PATCH /api/equipment/[id]
 * Обновление информации об оборудовании (только для администраторов и менеджеров)
 */
export const PATCH = withAdminOrManager(async (
    req: NextRequest,
    _user,
    { params }: { params: { id: string } }
) => {
    try {
        const { id } = params;
        const body = await req.json();

        // Проверяем, что категория допустима, если она указана
        if (body.category) {
            const validCategories: EquipmentCategory[] = [
                'CAMERA', 'LENS', 'LIGHTING', 'AUDIO', 'ACCESSORY', 'OTHER'
            ];

            if (!validCategories.includes(body.category)) {
                return validationErrorResponse(`Категория должна быть одной из: ${validCategories.join(', ')}`);
            }
        }

        const supabase = createServerSupabaseClient();

        // Проверяем, существует ли оборудование
        const { data: existingEquipment, error: checkError } = await supabase
            .from('equipment')
            .select('id')
            .eq('id', id)
            .maybeSingle();

        if (checkError || !existingEquipment) {
            return notFoundResponse('Оборудование');
        }

        // Проверяем уникальность серийного номера, если он изменяется
        if (body.serial_number) {
            const { data: duplicateSerialNumber } = await supabase
                .from('equipment')
                .select('id')
                .eq('serial_number', body.serial_number)
                .neq('id', id)
                .maybeSingle();

            if (duplicateSerialNumber) {
                return validationErrorResponse('Оборудование с таким серийным номером уже существует');
            }
        }

        // Обновляем оборудование
        const { data, error } = await supabase
            .from('equipment')
            .update(body)
            .eq('id', id)
            .select()
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
 * DELETE /api/equipment/[id]
 * Удаление оборудования (только для администраторов и менеджеров)
 */
export const DELETE = withAdminOrManager(async (
    req: NextRequest,
    _user,
    { params }: { params: { id: string } }
) => {
    try {
        const { id } = params;

        const supabase = createServerSupabaseClient();

        // Проверяем, существует ли оборудование
        const { data: existingEquipment, error: checkError } = await supabase
            .from('equipment')
            .select('id')
            .eq('id', id)
            .maybeSingle();

        if (checkError || !existingEquipment) {
            return notFoundResponse('Оборудование');
        }

        // Проверяем, есть ли активные бронирования для этого оборудования
        const { data: activeBookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('id')
            .eq('equipment_id', id)
            .in('status', ['PENDING', 'APPROVED'])
            .limit(1);

        if (bookingsError) {
            throw bookingsError;
        }

        if (activeBookings && activeBookings.length > 0) {
            return validationErrorResponse('Невозможно удалить оборудование с активными бронированиями');
        }

        // Удаляем оборудование
        const { error } = await supabase
            .from('equipment')
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