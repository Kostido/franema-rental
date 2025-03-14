'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

interface TelegramVerificationProps {
    userId: string;
    isTelegramVerified: boolean;
}

export default function TelegramVerification({ userId, isTelegramVerified }: TelegramVerificationProps) {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleVerification = async () => {
        try {
            setIsLoading(true);

            // Открываем Telegram бота в новом окне
            const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
            if (!botUsername) {
                throw new Error('Telegram bot username is not configured');
            }

            window.open(`https://t.me/${botUsername}?start`, '_blank');

            toast.success('Перейдите в Telegram для завершения верификации');
        } catch (error) {
            console.error('Error during Telegram verification:', error);
            toast.error('Произошла ошибка при верификации через Telegram');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">Верификация через Telegram</h3>

            {isTelegramVerified ? (
                <div className="flex items-center gap-2 text-green-600">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span>Аккаунт верифицирован через Telegram</span>
                </div>
            ) : (
                <>
                    <p className="text-gray-600">
                        Для верификации вашего аккаунта через Telegram, нажмите кнопку ниже и следуйте инструкциям бота.
                    </p>
                    <Button
                        onClick={handleVerification}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Загрузка...' : 'Верифицировать через Telegram'}
                    </Button>
                </>
            )}
        </div>
    );
} 