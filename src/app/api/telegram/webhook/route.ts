import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Типы для Telegram Update
interface TelegramUpdate {
    update_id: number;
    message?: {
        message_id: number;
        from: {
            id: number;
            is_bot: boolean;
            first_name: string;
            last_name?: string;
            username?: string;
        };
        chat: {
            id: number;
            type: string;
            first_name: string;
            last_name?: string;
            username?: string;
        };
        date: number;
        text?: string;
    };
}

// Инициализация Supabase клиента с сервисной ролью
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
    try {
        // Проверка секретного токена для безопасности
        const authHeader = request.headers.get('x-telegram-bot-api-secret-token');
        if (authHeader !== process.env.TELEGRAM_WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Получение данных из запроса
        const update: TelegramUpdate = await request.json();

        // Проверка наличия сообщения
        if (!update.message || !update.message.text) {
            return NextResponse.json({ status: 'ok' });
        }

        const { text, from, chat } = update.message;
        const telegramId = from.id.toString();

        // Обработка команды /start
        if (text === '/start') {
            await sendTelegramMessage(
                chat.id,
                'Добро пожаловать в бот Franema Rental! Отправьте ваш код верификации для связи с аккаунтом.'
            );
            return NextResponse.json({ status: 'ok' });
        }

        // Проверка, является ли сообщение кодом верификации (простая проверка на 6 символов)
        if (text.length === 6) {
            // Поиск кода верификации в базе данных
            const { data: verifications, error: fetchError } = await supabaseAdmin
                .from('telegram_verifications')
                .select('*')
                .eq('verification_code', text.toUpperCase())
                .eq('is_verified', false)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError) {
                console.error('Ошибка при поиске кода верификации:', fetchError);
                await sendTelegramMessage(chat.id, 'Произошла ошибка при проверке кода. Пожалуйста, попробуйте позже.');
                return NextResponse.json({ status: 'error', error: fetchError.message });
            }

            // Если код найден, обновляем запись
            if (verifications && verifications.length > 0) {
                const verification = verifications[0];

                // Обновляем запись верификации
                const { error: updateVerificationError } = await supabaseAdmin
                    .from('telegram_verifications')
                    .update({
                        is_verified: true,
                        telegram_id: telegramId,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', verification.id);

                if (updateVerificationError) {
                    console.error('Ошибка при обновлении верификации:', updateVerificationError);
                    await sendTelegramMessage(chat.id, 'Произошла ошибка при верификации. Пожалуйста, попробуйте позже.');
                    return NextResponse.json({ status: 'error', error: updateVerificationError.message });
                }

                // Обновляем профиль пользователя
                const { error: updateUserError } = await supabaseAdmin
                    .from('users')
                    .update({
                        telegram_id: telegramId,
                        is_verified: true,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', verification.user_id);

                if (updateUserError) {
                    console.error('Ошибка при обновлении пользователя:', updateUserError);
                    await sendTelegramMessage(chat.id, 'Произошла ошибка при связывании аккаунта. Пожалуйста, попробуйте позже.');
                    return NextResponse.json({ status: 'error', error: updateUserError.message });
                }

                // Отправляем сообщение об успешной верификации
                await sendTelegramMessage(
                    chat.id,
                    'Ваш аккаунт успешно верифицирован! Теперь вы будете получать уведомления о бронированиях.'
                );

                return NextResponse.json({ status: 'ok', verified: true });
            } else {
                // Код не найден или истек
                await sendTelegramMessage(
                    chat.id,
                    'Код верификации недействителен или истек. Пожалуйста, получите новый код в приложении.'
                );
                return NextResponse.json({ status: 'ok', verified: false });
            }
        }

        // Для всех остальных сообщений
        await sendTelegramMessage(
            chat.id,
            'Отправьте ваш код верификации для связи с аккаунтом или используйте команду /start для начала.'
        );

        return NextResponse.json({ status: 'ok' });
    } catch (error: any) {
        console.error('Ошибка при обработке вебхука:', error);
        return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
    }
}

// Функция для отправки сообщений через Telegram Bot API
async function sendTelegramMessage(chatId: number, text: string) {
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!telegramToken) {
        throw new Error('TELEGRAM_BOT_TOKEN не настроен');
    }

    const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка при отправке сообщения: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
} 