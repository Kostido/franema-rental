import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, handleApiError, validationErrorResponse } from '@/lib/api/api-response';
import { withAuth } from '@/lib/api/auth-helpers';

/**
 * GET /api/profile
 * Получение профиля текущего пользователя
 */
export const GET = withAuth(async (req: NextRequest, user) => {
    try {
        return successResponse(user);
    } catch (error) {
        return handleApiError(error);
    }
});

/**
 * PATCH /api/profile
 * Обновление профиля текущего пользователя
 */
export const PATCH = withAuth(async (req: NextRequest, user) => {
    try {
        const body = await req.json();

        // Пользователи не могут менять свою роль
        if (body.role) {
            return validationErrorResponse('Вы не можете изменить свою роль');
        }

        // Пользователи не могут менять статус верификации
        if (body.is_verified !== undefined) {
            return validationErrorResponse('Вы не можете изменить статус верификации');
        }

        // Пользователи не могут напрямую менять свой Telegram ID
        if (body.telegram_id !== undefined) {
            return validationErrorResponse('Вы не можете напрямую изменить свой Telegram ID');
        }

        const supabase = await createServerSupabaseClient();

        // Если пользователь меняет email, нужно обновить его и в auth.users
        if (body.email && body.email !== user.email) {
            const { error: authError } = await supabase.auth.updateUser({
                email: body.email,
            });

            if (authError) {
                throw authError;
            }
        }

        // Обновляем профиль пользователя
        const { data, error } = await supabase
            .from('users')
            .update(body)
            .eq('id', user.id)
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