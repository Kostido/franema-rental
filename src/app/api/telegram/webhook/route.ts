import { NextRequest } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { successResponse, handleApiError, validationErrorResponse } from '@/lib/api/api-response';

/**
 * Проверяет, что запрос пришел от Telegram
 */
function validateTelegramRequest(req: NextRequest): boolean {
    const telegramWebhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

    if (!telegramWebhookSecret) {
        console.error('TELEGRAM_WEBHOOK_SECRET не настроен');
        return false;
    }

    const secretHeader = req.headers.get('X-Telegram-Bot-Api-Secret-Token');

    return secretHeader === telegramWebhookSecret;
}

/**
 * Обрабатывает команду /start с кодом верификации
 */
async function handleStartCommand(text: string, telegramId: number): Promise<{ success: boolean; message: string }> {
    // Проверяем, содержит ли команда код верификации
    const match = text.match(/^\/start\s+([A-Z0-9]{6})$/);

    if (!match) {
        return {
            success: false,
            message: 'Пожалуйста, используйте команду /start с кодом верификации, который вы получили на сайте.',
        };
    }

    const verificationCode = match[1];
    const supabase = await createServiceRoleSupabaseClient();

    // Ищем код верификации в базе данных
    const { data: verification, error: verificationError } = await supabase
        .from('telegram_verifications')
        .select('*')
        .eq('verification_code', verificationCode as any)
        .eq('is_verified', false as any)
        .single();

    if (verificationError || !verification) {
        return {
            success: false,
            message: 'Неверный или устаревший код верификации. Пожалуйста, сгенерируйте новый код на сайте.',
        };
    }

    // Приводим verification к типу с нужными полями
    const typedVerification = verification as any;

    // Проверяем, не истек ли срок действия кода
    const expiresAt = new Date(typedVerification.expires_at);
    const now = new Date();

    if (expiresAt < now) {
        return {
            success: false,
            message: 'Срок действия кода верификации истек. Пожалуйста, сгенерируйте новый код на сайте.',
        };
    }

    // Обновляем запись верификации
    const { error: updateVerificationError } = await supabase
        .from('telegram_verifications')
        .update({
            is_verified: true,
            telegram_id: telegramId.toString(),
        } as any)
        .eq('id', typedVerification.id);

    if (updateVerificationError) {
        console.error('Ошибка при обновлении верификации:', updateVerificationError);
        return {
            success: false,
            message: 'Произошла ошибка при верификации. Пожалуйста, попробуйте позже.',
        };
    }

    // Обновляем профиль пользователя
    const { error: updateUserError } = await supabase
        .from('users')
        .update({
            telegram_id: telegramId.toString(),
            is_verified: true,
        } as any)
        .eq('id', typedVerification.user_id);

    if (updateUserError) {
        console.error('Ошибка при обновлении пользователя:', updateUserError);
        return {
            success: false,
            message: 'Произошла ошибка при верификации. Пожалуйста, попробуйте позже.',
        };
    }

    return {
        success: true,
        message: 'Ваш аккаунт успешно верифицирован! Теперь вы можете бронировать оборудование и получать уведомления через Telegram.',
    };
}

/**
 * POST /api/telegram/webhook
 * Обработка вебхуков от Telegram-бота
 */
export async function POST(req: NextRequest) {
    try {
        // Проверяем, что запрос пришел от Telegram
        if (!validateTelegramRequest(req)) {
            return validationErrorResponse('Неавторизованный запрос');
        }

        const body = await req.json();

        // Проверяем, что это сообщение
        if (!body.message) {
            return successResponse({ ok: true });
        }

        const { message } = body;
        const { text, from } = message;

        // Проверяем, что это команда /start
        if (text && text.startsWith('/start')) {
            const result = await handleStartCommand(text, from.id);

            // Отправляем ответное сообщение пользователю
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: from.id,
                    text: result.message,
                }),
            });
        }

        return successResponse({ ok: true });
    } catch (error) {
        return handleApiError(error);
    }
} 