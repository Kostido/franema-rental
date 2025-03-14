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

    useEffect(() => {
        // Получаем имя бота из переменных окружения на клиенте
        const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
        console.log('Имя бота из переменных окружения:', botUsername);

        if (botUsername) {
            // Убираем возможные пробелы в начале и конце
            setBotName(botUsername.trim());
        } else {
            console.error('Переменная окружения NEXT_PUBLIC_TELEGRAM_BOT_USERNAME не задана');
        }

        setIsLoading(false);
    }, []);

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