import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, handleApiError, validationErrorResponse } from '@/lib/api/api-response';
import { withAdminOrManager } from '@/lib/api/auth-helpers';
import { EquipmentCategory } from '@/types/supabase';

/**
 * GET /api/equipment
 * Получение списка оборудования с возможностью фильтрации
 */
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const category = searchParams.get('category') as EquipmentCategory | null;
        const available = searchParams.get('available');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const supabase = await createServerSupabaseClient();

        let query = supabase
            .from('equipment')
            .select('*', { count: 'exact' });

        // Применяем фильтры, если они указаны
        if (category) {
            query = query.eq('category', category);
        }

        if (available !== null) {
            query = query.eq('is_available', available === 'true');
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,serial_number.ilike.%${search}%`);
        }

        // Добавляем пагинацию
        query = query.range(offset, offset + limit - 1);

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
}

/**
 * POST /api/equipment
 * Создание нового оборудования (только для администраторов и менеджеров)
 */
export const POST = withAdminOrManager(async (req: NextRequest) => {
    try {
        const body = await req.json();

        // Проверяем обязательные поля
        const { name, description, category, serial_number } = body;

        if (!name || !description || !category || !serial_number) {
            return validationErrorResponse('Необходимо указать name, description, category и serial_number');
        }

        // Проверяем, что категория допустима
        const validCategories: EquipmentCategory[] = [
            'CAMERA', 'LENS', 'LIGHTING', 'AUDIO', 'ACCESSORY', 'OTHER'
        ];

        if (!validCategories.includes(category)) {
            return validationErrorResponse(`Категория должна быть одной из: ${validCategories.join(', ')}`);
        }

        const supabase = await createServerSupabaseClient();

        // Проверяем уникальность серийного номера
        const { data: existingEquipment } = await supabase
            .from('equipment')
            .select('id')
            .eq('serial_number', serial_number)
            .maybeSingle();

        if (existingEquipment) {
            return validationErrorResponse('Оборудование с таким серийным номером уже существует');
        }

        // Создаем новое оборудование
        const { data, error } = await supabase
            .from('equipment')
            .insert(body)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return successResponse(data, 201);
    } catch (error) {
        return handleApiError(error);
    }
}); 