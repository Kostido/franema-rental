/**
 * Интерфейс для данных пользователя, полученных от Telegram Login Widget
 */
export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

export interface TelegramChat {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
}

export interface TelegramMessage {
    message_id: number;
    from?: TelegramUser;
    chat: TelegramChat;
    date: number;
    text?: string;
    entities?: TelegramMessageEntity[];
}

export interface TelegramMessageEntity {
    type: string;
    offset: number;
    length: number;
}

export interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
    edited_message?: TelegramMessage;
    channel_post?: TelegramMessage;
    edited_channel_post?: TelegramMessage;
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

export interface TelegramLoginUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

// Расширяем глобальный интерфейс Window
declare global {
    interface Window {
        onTelegramAuth?: (user: TelegramUser) => void;
    }
}

export { }; 