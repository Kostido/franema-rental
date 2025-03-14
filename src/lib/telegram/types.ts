export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    is_bot: boolean;
}

export interface TelegramMessage {
    message_id: number;
    from: TelegramUser;
    chat: {
        id: number;
        type: 'private' | 'group' | 'supergroup' | 'channel';
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
        data: string;
    };
}

export interface TelegramVerificationData {
    userId: string;
    verificationCode: string;
    telegramId?: number;
    status: 'pending' | 'verified' | 'expired';
    createdAt: Date;
    expiresAt: Date;
} 