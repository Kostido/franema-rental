import { NextRequest, NextResponse } from 'next/server';
import { TelegramBot } from '@/lib/telegram';
import { TelegramUpdate } from '@/types/telegram';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { TELEGRAM_COMMANDS, TELEGRAM_CONFIG } from '@/lib/telegram/config';
import { sendTelegramMessage } from '@/lib/telegram/api';

export async function POST(request: Request) {
    try {
        // Проверяем секретный токен
        const secretToken = request.headers.get('x-telegram-bot-api-secret-token');
        if (secretToken !== TELEGRAM_CONFIG.WEBHOOK_SECRET) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const update: TelegramUpdate = await request.json();
        const message = update.message;

        if (!message || !message.text) {
            return new NextResponse('OK', { status: 200 });
        }

        const supabase = await createClient();

        switch (message.text) {
            case TELEGRAM_COMMANDS.START:
                await sendTelegramMessage(
                    message.chat.id,
                    'Привет! Я бот для верификации пользователей Franema Rental. Используйте команду /verify для начала процесса верификации.'
                );
                break;

            case TELEGRAM_COMMANDS.VERIFY:
                // Проверяем, есть ли уже верификация для этого Telegram ID
                const { data: existingVerification } = await supabase
                    .from('telegram_verifications')
                    .select('*')
                    .eq('telegram_id', message.from.id)
                    .eq('status', 'verified')
                    .single();

                if (existingVerification) {
                    await sendTelegramMessage(
                        message.chat.id,
                        'Вы уже верифицированы в системе!'
                    );
                    break;
                }

                // Генерируем новый код верификации
                const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

                // Сохраняем код в базе данных
                const { error } = await supabase
                    .from('telegram_verifications')
                    .insert({
                        telegram_id: message.from.id,
                        verification_code: verificationCode,
                        status: 'pending',
                        expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 минут
                    });

                if (error) {
                    console.error('Error saving verification:', error);
                    await sendTelegramMessage(
                        message.chat.id,
                        'Произошла ошибка при создании кода верификации. Пожалуйста, попробуйте позже.'
                    );
                    break;
                }

                await sendTelegramMessage(
                    message.chat.id,
                    `Ваш код верификации: ${verificationCode}\n\nВведите этот код на сайте для завершения верификации.`
                );
                break;

            case TELEGRAM_COMMANDS.HELP:
                await sendTelegramMessage(
                    message.chat.id,
                    'Доступные команды:\n' +
                    '/start - Начать работу с ботом\n' +
                    '/verify - Получить код верификации\n' +
                    '/help - Показать это сообщение'
                );
                break;

            default:
                await sendTelegramMessage(
                    message.chat.id,
                    'Неизвестная команда. Используйте /help для просмотра доступных команд.'
                );
        }

        return new NextResponse('OK', { status: 200 });
    } catch (error) {
        console.error('Webhook error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 