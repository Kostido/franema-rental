import { NextResponse } from 'next/server';
import { TELEGRAM_CONFIG } from '@/lib/telegram/config';

export async function GET() {
    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

        if (!appUrl) {
            throw new Error('NEXT_PUBLIC_APP_URL не задан в переменных окружения');
        }

        if (!botToken) {
            throw new Error('TELEGRAM_BOT_TOKEN не задан в переменных окружения');
        }

        if (!webhookSecret) {
            throw new Error('TELEGRAM_WEBHOOK_SECRET не задан в переменных окружения');
        }

        // Формируем URL вебхука
        const webhookUrl = `${appUrl}/api/telegram/webhook`;
        console.log('Настройка вебхука Telegram:', webhookUrl);

        // Получаем текущие настройки вебхука
        const infoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
        const webhookInfo = await infoResponse.json();

        console.log('Текущие настройки вебхука:', webhookInfo);

        // Устанавливаем новый вебхук
        const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: webhookUrl,
                secret_token: webhookSecret,
                allowed_updates: ['message', 'callback_query'],
            }),
        });

        const result = await response.json();

        if (!result.ok) {
            throw new Error(`Ошибка установки вебхука: ${result.description}`);
        }

        // Проверяем установку вебхука
        const verifyResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
        const verifyInfo = await verifyResponse.json();

        return NextResponse.json({
            ok: true,
            message: 'Вебхук Telegram успешно настроен',
            webhook_url: webhookUrl,
            previous_webhook: webhookInfo.result,
            current_webhook: verifyInfo.result,
        });
    } catch (error: any) {
        console.error('Ошибка настройки вебхука Telegram:', error);
        return NextResponse.json(
            {
                ok: false,
                error: error.message || 'Ошибка настройки вебхука Telegram',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
} 