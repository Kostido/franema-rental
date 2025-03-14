import { TELEGRAM_CONFIG } from './config';

const TELEGRAM_API = 'https://api.telegram.org';

export async function sendTelegramMessage(chatId: number, text: string, options?: {
    parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    reply_markup?: any;
}) {
    const response = await fetch(`${TELEGRAM_API}/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            ...options,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to send Telegram message: ${response.statusText}`);
    }

    return response.json();
}

export async function setTelegramWebhook() {
    const response = await fetch(`${TELEGRAM_API}/bot${TELEGRAM_CONFIG.BOT_TOKEN}/setWebhook`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            url: TELEGRAM_CONFIG.WEBHOOK_URL,
            secret_token: TELEGRAM_CONFIG.WEBHOOK_SECRET,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to set webhook: ${response.statusText}`);
    }

    return response.json();
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
    const response = await fetch(`${TELEGRAM_API}/bot${TELEGRAM_CONFIG.BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            callback_query_id: callbackQueryId,
            text,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to answer callback query: ${response.statusText}`);
    }

    return response.json();
} 