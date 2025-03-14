export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
}

export interface TelegramMessage {
    message_id: number;
    from: TelegramUser;
    chat: {
        id: number;
        type: string;
    };
    date: number;
    text?: string;
}

export interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
    callback_query?: {
        id: string;
        from: TelegramUser;
        message?: TelegramMessage;
        data?: string;
    };
}

export interface TelegramWebhookResponse {
    ok: boolean;
    result: boolean;
    description?: string;
}

export interface TelegramApiResponse<T> {
    ok: boolean;
    result: T;
    description?: string;
} 