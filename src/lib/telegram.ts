import { TelegramApiResponse } from '@/types/telegram';

const TELEGRAM_API_URL = 'https://api.telegram.org';

export class TelegramBot {
    private token: string;
    private webhookSecret: string;

    constructor() {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

        if (!token) {
            throw new Error('TELEGRAM_BOT_TOKEN is not set');
        }

        if (!webhookSecret) {
            throw new Error('TELEGRAM_WEBHOOK_SECRET is not set');
        }

        this.token = token;
        this.webhookSecret = webhookSecret;
    }

    async sendMessage(chatId: number, text: string, options: any = {}) {
        const response = await fetch(`${TELEGRAM_API_URL}/bot${this.token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: 'HTML',
                ...options,
            }),
        });

        const data: TelegramApiResponse<any> = await response.json();
        return data;
    }

    async setWebhook(url: string) {
        const response = await fetch(`${TELEGRAM_API_URL}/bot${this.token}/setWebhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: `${url}?secret=${this.webhookSecret}`,
                allowed_updates: ['message', 'callback_query'],
            }),
        });

        const data: TelegramApiResponse<any> = await response.json();
        return data;
    }

    verifyWebhookRequest(secret?: string) {
        return secret === this.webhookSecret;
    }

    async answerCallbackQuery(callbackQueryId: string, text?: string) {
        const response = await fetch(`${TELEGRAM_API_URL}/bot${this.token}/answerCallbackQuery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                callback_query_id: callbackQueryId,
                text,
            }),
        });

        const data: TelegramApiResponse<any> = await response.json();
        return data;
    }
} 