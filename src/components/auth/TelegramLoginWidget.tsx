'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

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
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Отладочная информация
    console.log('TelegramLoginWidget - botName:', botName);

    useEffect(() => {
        // Определяем функцию обработки авторизации
        window.onTelegramAuth = async (user: TelegramUser) => {
            try {
                console.log('Telegram авторизация получена:', user);

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
                console.log('Ответ от сервера:', data);

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
            try {
                console.log('Создаем скрипт для виджета Telegram для бота:', botName);
                setIsLoading(true);

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

                // Обработчики событий для скрипта
                script.onload = () => {
                    console.log('Скрипт Telegram виджета загружен успешно');
                    setIsLoading(false);
                };

                script.onerror = (e) => {
                    console.error('Ошибка загрузки скрипта Telegram виджета:', e);
                    setError('Не удалось загрузить виджет Telegram');
                    setIsLoading(false);
                };

                widgetRef.current.appendChild(script);
            } catch (e) {
                console.error('Ошибка при создании скрипта:', e);
                setError('Ошибка при инициализации виджета Telegram');
                setIsLoading(false);
            }
        }

        return () => {
            // Очищаем глобальную функцию при размонтировании компонента
            if (window.onTelegramAuth) {
                window.onTelegramAuth = undefined;
            }
        };
    }, [botName, buttonSize, cornerRadius, showUserPhoto, requestAccess, redirectUrl, onAuth, router, supabase]);

    return (
        <div className="w-full flex flex-col items-center">
            {isLoading && <div className="text-xs text-gray-500 mb-2">Загрузка виджета...</div>}
            {error && <div className="text-xs text-red-500 mb-2">{error}</div>}
            <div className="telegram-login-widget" ref={widgetRef}>
                {/* Здесь будет отображаться виджет Telegram Login */}
            </div>
        </div>
    );
} 