'use client';

import { useEffect, useRef } from 'react';

interface TelegramLoginClientComponentProps {
    botName: string;
}

export default function TelegramLoginClientComponent({ botName }: TelegramLoginClientComponentProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Определяем функцию обработки авторизации в глобальной области видимости
        window.onTelegramAuth = (user: any) => {
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
                        window.location.href = '/profile';
                    }
                })
                .catch(error => {
                    console.error('Ошибка авторизации через Telegram:', error);
                    alert(error.message || 'Произошла ошибка при авторизации через Telegram');
                });
        };

        // Создаем и добавляем скрипт для виджета Telegram
        if (containerRef.current) {
            // Очищаем контейнер
            containerRef.current.innerHTML = '';

            // Создаем скрипт
            const script = document.createElement('script');
            script.src = 'https://telegram.org/js/telegram-widget.js?22';
            script.setAttribute('data-telegram-login', botName);
            script.setAttribute('data-size', 'large');
            script.setAttribute('data-radius', '8');
            script.setAttribute('data-userpic', 'true');
            script.setAttribute('data-onauth', 'onTelegramAuth(user)');
            script.async = true;

            // Добавляем скрипт в контейнер
            containerRef.current.appendChild(script);
        }

        // Очистка при размонтировании
        return () => {
            if (window.onTelegramAuth) {
                // @ts-ignore
                window.onTelegramAuth = undefined;
            }
        };
    }, [botName]);

    return (
        <div className="telegram-login-container" ref={containerRef}>
            {/* Здесь будет отображаться виджет Telegram Login */}
        </div>
    );
}

// Добавляем типы для глобального объекта window
declare global {
    interface Window {
        onTelegramAuth: (user: any) => void;
    }
} 