'use client';

import { useEffect, useRef, useState } from 'react';
import { TelegramUser } from '@/types/telegram';
import { useRouter } from 'next/navigation';

// Не нужно объявлять глобальный интерфейс Window здесь,
// так как он уже объявлен в src/types/telegram.ts

interface TelegramLoginClientComponentProps {
    botName: string;
}

export default function TelegramLoginClientComponent({ botName }: TelegramLoginClientComponentProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Проверяем, что имя бота не пустое
        if (!botName) {
            setError('Имя бота не задано. Проверьте переменную окружения NEXT_PUBLIC_TELEGRAM_BOT_USERNAME.');
            return;
        }

        // Удаляем символ @ из имени бота, если он присутствует
        const cleanBotName = botName.startsWith('@') ? botName.substring(1) : botName;

        console.log('Инициализация Telegram Login Widget с именем бота:', cleanBotName);

        // Определяем функцию обработки авторизации в глобальной области видимости
        window.onTelegramAuth = (user: TelegramUser) => {
            console.log('Telegram авторизация получена:', user);

            // Отправляем данные на сервер для проверки и авторизации
            fetch('/api/auth/telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(error => {
                            throw new Error(error.message || 'Ошибка авторизации через Telegram');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Ответ от сервера:', data);

                    // Если авторизация успешна и получен JWT-токен
                    if (data.token) {
                        // Устанавливаем JWT-токен в localStorage
                        localStorage.setItem('supabase.auth.token', JSON.stringify({
                            access_token: data.token,
                            token_type: 'bearer',
                            expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 дней
                        }));

                        // Показываем уведомление об успешной авторизации
                        alert('Вы успешно вошли через Telegram');

                        // Перенаправляем пользователя
                        router.push('/profile');
                    }
                })
                .catch(error => {
                    console.error('Ошибка авторизации через Telegram:', error);
                    alert(error.message || 'Произошла ошибка при авторизации через Telegram');
                });
        };

        // Создаем и добавляем скрипт для виджета Telegram
        if (containerRef.current) {
            try {
                // Очищаем контейнер
                containerRef.current.innerHTML = '';

                // Создаем скрипт
                const script = document.createElement('script');
                script.src = 'https://telegram.org/js/telegram-widget.js?22';
                script.setAttribute('data-telegram-login', cleanBotName);
                script.setAttribute('data-size', 'large');
                script.setAttribute('data-radius', '8');
                script.setAttribute('data-userpic', 'true');
                script.setAttribute('data-onauth', 'onTelegramAuth(user)');
                script.async = true;

                // Обработчик ошибок для скрипта
                script.onerror = (e) => {
                    console.error('Ошибка загрузки скрипта Telegram:', e);
                    setError('Не удалось загрузить виджет Telegram. Проверьте подключение к интернету и настройки бота.');
                };

                // Добавляем скрипт в контейнер
                containerRef.current.appendChild(script);
                console.log('Скрипт Telegram Login Widget добавлен в DOM с именем бота:', cleanBotName);
            } catch (e) {
                console.error('Ошибка при инициализации виджета Telegram:', e);
                setError('Произошла ошибка при инициализации виджета Telegram.');
            }
        }

        // Очистка при размонтировании
        return () => {
            if (window.onTelegramAuth) {
                window.onTelegramAuth = undefined;
            }
        };
    }, [botName, router]);

    return (
        <div className="telegram-login-container w-full">
            {error ? (
                <div className="text-red-500 text-sm p-2 border border-red-200 rounded bg-red-50">
                    {error}
                </div>
            ) : (
                <div ref={containerRef} className="flex justify-center min-h-[36px]">
                    {/* Здесь будет отображаться виджет Telegram Login */}
                    <div className="text-gray-400 text-sm">Загрузка виджета Telegram...</div>
                </div>
            )}
        </div>
    );
} 