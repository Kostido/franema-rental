import { NextRequest, NextResponse } from 'next/server';
import { TelegramBot } from '@/lib/telegram';
import { TelegramUpdate } from '@/types/telegram';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const secret = searchParams.get('secret');

        const bot = new TelegramBot();
        if (!bot.verifyWebhookRequest(secret || '')) {
            return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 403 });
        }

        const update: TelegramUpdate = await request.json();
        const supabase = await createClient();

        // Обработка команды /start
        if (update.message?.text === '/start') {
            const { data: existingUser } = await supabase
                .from('telegram_users')
                .select('*')
                .eq('telegram_id', update.message.from.id)
                .single();

            if (!existingUser) {
                // Создаем новую запись о пользователе Telegram
                await supabase.from('telegram_users').insert({
                    telegram_id: update.message.from.id,
                    username: update.message.from.username,
                    first_name: update.message.from.first_name,
                    last_name: update.message.from.last_name,
                    verification_status: 'pending',
                });

                await bot.sendMessage(
                    update.message.chat.id,
                    'Добро пожаловать! Для верификации вашего аккаунта, пожалуйста, перейдите на сайт и войдите в систему.'
                );
            } else {
                await bot.sendMessage(
                    update.message.chat.id,
                    'Вы уже зарегистрированы в системе. Если у вас есть вопросы, обратитесь к администратору.'
                );
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 