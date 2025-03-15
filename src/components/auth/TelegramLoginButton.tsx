'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { LoginButton } from '@telegram-auth/react';

interface TelegramLoginButtonProps {
    botName: string;
    buttonSize?: 'large' | 'medium' | 'small';
    cornerRadius?: number;
    showUserPhoto?: boolean;
}

export default function TelegramLoginButton({
    botName,
    buttonSize = 'large',
    cornerRadius = 8,
    showUserPhoto = true
}: TelegramLoginButtonProps) {
    // Отладочная информация
    useEffect(() => {
        console.log('TelegramLoginButton - botName:', botName);
    }, [botName]);

    if (!botName) {
        return <div className="text-center text-red-500">Ошибка: имя бота не задано</div>;
    }

    return (
        <div className="w-full flex justify-center">
            <LoginButton
                botUsername={botName}
                onAuthCallback={(data) => {
                    console.log('Получены данные от Telegram:', data);
                    signIn('telegram-login', { callbackUrl: '/' }, data as any);
                }}
                buttonSize={buttonSize}
                cornerRadius={cornerRadius}
                showUserPhoto={showUserPhoto}
                className="telegram-login-button"
            />
        </div>
    );
} 