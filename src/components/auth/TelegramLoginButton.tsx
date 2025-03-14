'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Динамически импортируем компонент TelegramLoginWidget, чтобы избежать ошибок SSR
const TelegramLoginWidget = dynamic(
    () => import('@/components/auth/TelegramLoginWidget'),
    { ssr: false }
);

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
    const [isMounted, setIsMounted] = useState(false);

    // Отладочная информация
    console.log('TelegramLoginButton - botName:', botName);

    // Используем useEffect для отображения компонента только на клиенте
    useEffect(() => {
        setIsMounted(true);
        console.log('TelegramLoginButton - компонент смонтирован');
    }, []);

    if (!isMounted) {
        return <div className="text-center text-xs text-gray-500">Загрузка виджета Telegram...</div>;
    }

    if (!botName) {
        return <div className="text-center text-red-500">Ошибка: имя бота не задано</div>;
    }

    return (
        <div className="w-full flex justify-center">
            <div className="text-center text-xs text-gray-500 mb-2">
                Загружаем виджет для бота: {botName}
            </div>
            <TelegramLoginWidget
                botName={botName}
                buttonSize={buttonSize}
                cornerRadius={cornerRadius}
                showUserPhoto={showUserPhoto}
            />
        </div>
    );
} 