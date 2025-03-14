import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, handleApiError, validationErrorResponse } from '@/lib/api/api-response';
import { withAuth } from '@/lib/api/auth-helpers';
import { randomBytes } from 'crypto';

/**
 * Генерирует случайный код верификации
 */
function generateVerificationCode(length = 6): string {
    return randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length)
        .toUpperCase();
}

/**
 * POST /api/telegram/verification
 * Создание нового кода верификации для пользователя
 */
export const POST = withAuth(async (req: NextRequest, user) => {
    try {
        // Проверяем, верифицирован ли уже пользователь
        if (user.is_verified) {
            return validationErrorResponse('Ваш аккаунт уже верифицирован');
        }

        const supabase = createServerSupabaseClient();

        // Генерируем код верификации
        const verificationCode = generateVerificationCode();

        // Устанавливаем срок действия кода (24 часа)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Удаляем предыдущие коды верификации пользователя
        await supabase
            .from('telegram_verifications')
            .delete()
            .eq('user_id', user.id);

        // Создаем новый код верификации
        const { data, error } = await supabase
            .from('telegram_verifications')
            .insert({
                user_id: user.id,
                verification_code: verificationCode,
                expires_at: expiresAt.toISOString(),
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return successResponse({
            verification_code: data.verification_code,
            expires_at: data.expires_at,
        });
    } catch (error) {
        return handleApiError(error);
    }
});

/**
 * GET /api/telegram/verification
 * Получение текущего статуса верификации пользователя
 */
export const GET = withAuth(async (req: NextRequest, user) => {
    try {
        const supabase = createServerSupabaseClient();

        // Получаем текущий код верификации пользователя
        const { data, error } = await supabase
            .from('telegram_verifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return successResponse({
            is_verified: user.is_verified,
            telegram_id: user.telegram_id,
            verification: data ? {
                verification_code: data.verification_code,
                expires_at: data.expires_at,
                is_verified: data.is_verified,
            } : null,
        });
    } catch (error) {
        return handleApiError(error);
    }
}); 