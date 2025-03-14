import { NextResponse } from 'next/server';
import { TelegramBot } from '@/lib/telegram';

export async function GET() {
    try {
        const bot = new TelegramBot();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;

        if (!appUrl) {
            throw new Error('NEXT_PUBLIC_APP_URL is not set');
        }

        // Устанавливаем вебхук для Telegram бота
        const webhookUrl = `${appUrl}/api/telegram/webhook`;
        const result = await bot.setWebhook(webhookUrl);

        if (!result.ok) {
            throw new Error(`Failed to set webhook: ${result.description}`);
        }

        return NextResponse.json({
            ok: true,
            message: 'Telegram webhook set successfully',
            webhookUrl,
        });
    } catch (error) {
        console.error('Error setting up Telegram webhook:', error);
        return NextResponse.json(
            { error: 'Failed to set up Telegram webhook' },
            { status: 500 }
        );
    }
} 