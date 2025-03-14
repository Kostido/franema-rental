'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Script from 'next/script';

interface TelegramLoginWidgetProps {
    botName: string;
    buttonSize?: 'large' | 'medium' | 'small';
    cornerRadius?: number;
    showUserPhoto?: boolean;
    requestAccess?: boolean;
    redirectUrl?: string;
    onAuth?: (user: TelegramUser) => void;
}

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

declare global {
    interface Window {
        onTelegramAuth?: (user: TelegramUser) => void;
    }
}

export default function TelegramLoginWidget({
    botName,
    buttonSize = 'large',
    cornerRadius,
    showUserPhoto = true,
    requestAccess = false,
    redirectUrl,
    onAuth,
}: TelegramLoginWidgetProps) {
    const router = useRouter();
    const supabase = createClient();
    const widgetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Определяем функцию обработки авторизации
        window.onTelegramAuth = async (user: TelegramUser) => {
            try {
                // Отправляем данные на сервер для проверки и авторизации
                const response = await fetch('/api/auth/telegram', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Ошибка авторизации через Telegram');
                }

                const data = await response.json();

                // Если авторизация успешна и получен JWT-токен
                if (data.token) {
                    // Устанавливаем JWT-токен в localStorage
                    localStorage.setItem('supabase.auth.token', JSON.stringify({
                        access_token: data.token,
                        token_type: 'bearer',
                        expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 дней
                    }));

                    // Обновляем состояние авторизации в Supabase
                    await supabase.auth.refreshSession();

                    // Показываем уведомление об успешной авторизации
                    toast.success('Вы успешно вошли через Telegram');

                    // Перенаправляем пользователя
                    router.push('/profile');
                    router.refresh();
                }

                // Вызываем пользовательский обработчик, если он предоставлен
                if (onAuth) {
                    onAuth(user);
                }
            } catch (error: any) {
                console.error('Ошибка авторизации через Telegram:', error);
                toast.error(error.message || 'Произошла ошибка при авторизации через Telegram');
            }
        };

        // Создаем скрипт для виджета Telegram, если он еще не был добавлен
        if (widgetRef.current && widgetRef.current.childElementCount === 0) {
            const script = document.createElement('script');
            script.src = 'https://telegram.org/js/telegram-widget.js?22';
            script.setAttribute('data-telegram-login', botName);
            script.setAttribute('data-size', buttonSize);

            if (cornerRadius !== undefined) {
                script.setAttribute('data-radius', cornerRadius.toString());
            }

            if (showUserPhoto) {
                script.setAttribute('data-userpic', 'true');
            } else {
                script.setAttribute('data-userpic', 'false');
            }

            if (requestAccess) {
                script.setAttribute('data-request-access', 'write');
            }

            script.setAttribute('data-onauth', 'onTelegramAuth(user)');

            if (redirectUrl) {
                script.setAttribute('data-auth-url', redirectUrl);
            }

            script.async = true;
            widgetRef.current.appendChild(script);
        }

        return () => {
            // Очищаем глобальную функцию при размонтировании компонента
            if (window.onTelegramAuth) {
                window.onTelegramAuth = undefined;
            }
        };
    }, [botName, buttonSize, cornerRadius, showUserPhoto, requestAccess, redirectUrl, onAuth, router, supabase]);

    return (
        <div className="telegram-login-widget" ref={widgetRef}>
            {/* Здесь будет отображаться виджет Telegram Login */}
        </div>
    );
} 