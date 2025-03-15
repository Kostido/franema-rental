'use client';

import { useState } from 'react';
import { LoginButton } from '@telegram-auth/react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface TelegramLoginButtonProps {
    onSuccess?: (telegramUser: any) => void;
    onError?: (error: Error) => void;
    className?: string;
}

export default function TelegramLoginButton({
    onSuccess,
    onError,
    className,
}: TelegramLoginButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '';

    if (!botUsername) {
        console.error('Отсутствует NEXT_PUBLIC_TELEGRAM_BOT_USERNAME в переменных окружения');
        return null;
    }

    const handleTelegramAuth = async (telegramData: any) => {
        if (!telegramData) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(telegramData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка авторизации через Telegram');
            }

            toast.success('Успешная авторизация через Telegram');

            if (onSuccess) {
                onSuccess(data.user);
            }

            router.refresh();
        } catch (error: any) {
            console.error('Ошибка авторизации через Telegram:', error);
            toast.error(error.message || 'Произошла ошибка при авторизации через Telegram');

            if (onError) {
                onError(error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={className}>
            <LoginButton
                botUsername={botUsername}
                onAuthCallback={handleTelegramAuth}
            />
            {isLoading && <div className="mt-2 text-sm text-gray-500">Идет авторизация...</div>}
        </div>
    );
} 