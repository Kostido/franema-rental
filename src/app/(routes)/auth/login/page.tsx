'use client';

import Link from 'next/link';
import TelegramLoginClientComponent from '@/components/auth/TelegramLoginClientComponent';
import { FaTelegram } from 'react-icons/fa';
import { useEffect, useState } from 'react';

// Метаданные теперь должны быть определены в layout.tsx
// export const metadata: Metadata = {
//     title: 'Вход | Franema Rental',
//     description: 'Войдите в систему бронирования видеотехники через Telegram',
// };

export default function LoginPage() {
    const [botName, setBotName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [widgetFailed, setWidgetFailed] = useState<boolean>(false);

    useEffect(() => {
        // Получаем имя бота из переменных окружения на клиенте
        const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
        console.log('Имя бота из переменных окружения:', botUsername);

        if (botUsername) {
            setBotName(botUsername);
        } else {
            console.error('Переменная окружения NEXT_PUBLIC_TELEGRAM_BOT_USERNAME не задана');
        }

        setIsLoading(false);

        // Проверяем, есть ли сообщение об ошибке 404 в консоли через 5 секунд
        const timeoutId = setTimeout(() => {
            // Если в консоли есть сообщение о 404 ошибке, переключаемся на альтернативный метод
            if (document.querySelector('.telegram-login-container')?.textContent?.includes('Username invalid')) {
                console.log('Обнаружена ошибка с виджетом Telegram, переключаемся на альтернативный метод входа');
                setWidgetFailed(true);
            }
        }, 5000);

        return () => clearTimeout(timeoutId);
    }, []);

    const handleTelegramLogin = () => {
        const cleanBotName = botName.startsWith('@') ? botName.substring(1) : botName;
        // Открытие Telegram авторизации в новом окне
        const width = 550;
        const height = 470;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        window.open(
            `https://oauth.telegram.org/auth?bot_id=${cleanBotName}&origin=${encodeURIComponent(window.location.origin)}&return_to=${encodeURIComponent(window.location.href)}`,
            'Telegram Auth',
            `width=${width},height=${height},left=${left},top=${top}`
        );
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Вход в систему</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Войдите через Telegram для доступа к системе бронирования
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-full p-4 bg-blue-50 rounded-lg text-center">
                            <div className="flex items-center justify-center mb-4 text-blue-500">
                                <FaTelegram className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Вход через Telegram
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Быстрый и безопасный вход без пароля
                            </p>

                            {isLoading ? (
                                <div className="text-sm text-gray-500">
                                    Загрузка...
                                </div>
                            ) : widgetFailed ? (
                                // Альтернативная кнопка входа через Telegram
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleTelegramLogin}
                                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600"
                                    >
                                        <FaTelegram className="mr-2" />
                                        Войти через Telegram
                                    </button>
                                </div>
                            ) : botName ? (
                                <div className="flex justify-center">
                                    <TelegramLoginClientComponent botName={botName} />
                                </div>
                            ) : (
                                <div className="text-sm text-red-500">
                                    Не удалось загрузить виджет Telegram. Имя бота не задано в переменных окружения.
                                </div>
                            )}

                            {/* Отладочная информация */}
                            <div className="mt-4 text-xs text-gray-400">
                                Имя бота: {botName || 'Не задано'}
                            </div>

                            {/* Альтернативный способ входа */}
                            {!isLoading && botName && !widgetFailed && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => setWidgetFailed(true)}
                                        className="text-xs text-blue-500 hover:underline"
                                    >
                                        Проблемы с входом? Нажмите здесь для альтернативного способа
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Нет аккаунта?{' '}
                        <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                            Зарегистрируйтесь
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
} 