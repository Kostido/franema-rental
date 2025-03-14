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
    const [loadAttempts, setLoadAttempts] = useState(0);

    useEffect(() => {
        // Проверяем, что имя бота не пустое
        if (!botName) {
            setError('Имя бота не задано. Проверьте переменную окружения NEXT_PUBLIC_TELEGRAM_BOT_USERNAME.');
            return;
        }

        // Удаляем символ @ из имени бота, если он присутствует
        const cleanBotName = botName.startsWith('@') ? botName.substring(1) : botName;

        console.log(`Попытка #${loadAttempts + 1} инициализации Telegram Login Widget с именем бота:`, cleanBotName);

        // Функция для инициализации виджета
        const initWidget = () => {
            if (!containerRef.current) return;

            try {
                // Очищаем контейнер
                containerRef.current.innerHTML = '';

                // Создаем элемент-контейнер для виджета
                const widgetContainer = document.createElement('div');
                widgetContainer.id = 'telegram-login-container';
                containerRef.current.appendChild(widgetContainer);

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
                const script = document.createElement('script');
                script.async = true;
                script.src = 'https://telegram.org/js/telegram-widget.js?22';
                script.dataset.telegramLogin = cleanBotName; // Используем dataset для установки data-атрибутов
                script.dataset.size = 'large';
                script.dataset.radius = '8';
                script.dataset.userpic = 'true';
                script.dataset.onauth = 'onTelegramAuth(user)';

                // Обработчик ошибок
                script.onerror = (e) => {
                    console.error('Ошибка загрузки скрипта Telegram:', e);
                    setError('Не удалось загрузить виджет Telegram. Проверьте подключение к интернету и настройки бота.');

                    // Если меньше 3 попыток, попробуем загрузить снова через 2 секунды
                    if (loadAttempts < 2) {
                        setTimeout(() => {
                            setLoadAttempts(prev => prev + 1);
                        }, 2000);
                    }
                };

                // Обработчик успешной загрузки
                script.onload = () => {
                    console.log('Скрипт Telegram Login Widget успешно загружен для бота:', cleanBotName);
                };

                // Добавляем скрипт в DOM
                document.head.appendChild(script);
                console.log('Скрипт Telegram Login Widget добавлен в DOM для бота:', cleanBotName);

                // Прямая интеграция виджета через iframe как запасной вариант
                if (loadAttempts > 0) {
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://oauth.telegram.org/embed/${cleanBotName}?origin=${encodeURIComponent(window.location.origin)}&return_to=${encodeURIComponent(window.location.href)}`;
                    iframe.frameBorder = '0';
                    iframe.scrolling = 'no';
                    iframe.width = '280';
                    iframe.height = '40';
                    iframe.style.border = 'none';

                    widgetContainer.appendChild(iframe);
                    console.log('Добавлен iframe для Telegram Login Widget');
                }
            } catch (e) {
                console.error('Ошибка при инициализации виджета Telegram:', e);
                setError('Произошла ошибка при инициализации виджета Telegram.');
            }
        };

        // Инициализируем виджет
        initWidget();

        // Очистка при размонтировании
        return () => {
            if (window.onTelegramAuth) {
                window.onTelegramAuth = undefined;
            }

            // Удаляем скрипт
            const script = document.querySelector('script[data-telegram-login]');
            if (script) {
                script.remove();
            }
        };
    }, [botName, router, loadAttempts]);

    return (
        <div className="telegram-login-container w-full">
            {error ? (
                <div className="text-red-500 text-sm p-2 border border-red-200 rounded bg-red-50">
                    {error}
                    {loadAttempts < 3 && (
                        <button
                            className="ml-2 text-blue-500 underline"
                            onClick={() => setLoadAttempts(prev => prev + 1)}
                        >
                            Попробовать снова
                        </button>
                    )}
                </div>
            ) : (
                <div ref={containerRef} className="flex justify-center min-h-[40px]">
                    <div className="text-gray-400 text-sm">Загрузка виджета Telegram...</div>
                </div>
            )}
        </div>
    );
} 