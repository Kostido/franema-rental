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

    // Используем useEffect для отображения компонента только на клиенте
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted || !botName) {
        return null;
    }

    return (
        <div className="w-full flex justify-center">
            <TelegramLoginWidget
                botName={botName}
                buttonSize={buttonSize}
                cornerRadius={cornerRadius}
                showUserPhoto={showUserPhoto}
            />
        </div>
    );
} 