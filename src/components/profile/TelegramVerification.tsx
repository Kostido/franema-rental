'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import TelegramLoginButton from '@/components/auth/TelegramLoginButton';

interface TelegramVerificationProps {
    userId: string;
    isTelegramVerified: boolean;
}

export default function TelegramVerification({ userId, isTelegramVerified }: TelegramVerificationProps) {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    // Получаем имя бота из переменных окружения
    const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '';

    if (isTelegramVerified) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">Подключение Telegram</h3>

            <p className="text-gray-600">
                Подключите ваш Telegram-аккаунт для быстрого входа и получения уведомлений о бронированиях.
            </p>

            {botName && (
                <div className="flex justify-center mt-2">
                    <TelegramLoginButton botName={botName} />
                </div>
            )}
        </div>
    );
} 