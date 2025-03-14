'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaTelegram } from 'react-icons/fa';

interface TelegramVerificationProps {
    isVerified: boolean;
    telegramId: string | null;
}

export default function TelegramVerification({ isVerified, telegramId }: TelegramVerificationProps) {
    const [loading, setLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [botUsername, setBotUsername] = useState<string | null>(null);

    // Получаем имя бота из переменных окружения на клиенте
    useEffect(() => {
        const username = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
        if (username) {
            setBotUsername(username);
        }
    }, []);

    // Функция для получения текущего статуса верификации
    const checkVerificationStatus = async () => {
        try {
            const response = await fetch('/api/telegram/verification', {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Ошибка при получении статуса верификации');
            }

            const data = await response.json();

            if (data.data.verification) {
                setVerificationCode(data.data.verification.verification_code);
                setExpiresAt(data.data.verification.expires_at);
            } else {
                setVerificationCode(null);
                setExpiresAt(null);
            }
        } catch (error) {
            console.error('Ошибка при проверке статуса верификации:', error);
            toast.error('Не удалось получить статус верификации');
        }
    };

    // Функция для генерации нового кода верификации
    const generateVerificationCode = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/telegram/verification', {
                method: 'POST',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при генерации кода верификации');
            }

            const data = await response.json();

            setVerificationCode(data.data.verification_code);
            setExpiresAt(data.data.expires_at);

            toast.success('Код верификации успешно создан');
        } catch (error) {
            console.error('Ошибка при генерации кода верификации:', error);
            toast.error(error instanceof Error ? error.message : 'Ошибка при генерации кода верификации');
        } finally {
            setLoading(false);
        }
    };

    // Проверяем статус верификации при загрузке компонента
    useEffect(() => {
        if (!isVerified) {
            checkVerificationStatus();
        }
    }, [isVerified]);

    // Форматирование даты истечения срока действия
    const formatExpiryDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Создание ссылки на Telegram бота с кодом верификации
    const getTelegramLink = () => {
        if (!botUsername || !verificationCode) return '';

        return `https://t.me/${botUsername}?start=${verificationCode}`;
    };

    return (
        <div className="space-y-6">
            {isVerified ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                        <FaTelegram className="text-2xl text-blue-500" />
                        <div>
                            <h3 className="font-medium">Аккаунт верифицирован</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Ваш Telegram аккаунт успешно привязан к профилю
                            </p>
                            {telegramId && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    ID: {telegramId}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <h3 className="font-medium mb-2">Аккаунт не верифицирован</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Для бронирования оборудования необходимо верифицировать ваш аккаунт через Telegram.
                        </p>

                        {verificationCode ? (
                            <div className="space-y-4">
                                <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                                    <p className="text-sm font-medium mb-1">Ваш код верификации:</p>
                                    <div className="flex justify-between items-center">
                                        <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-lg font-mono">
                                            {verificationCode}
                                        </code>
                                        <button
                                            type="button"
                                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            onClick={() => {
                                                navigator.clipboard.writeText(verificationCode);
                                                toast.success('Код скопирован в буфер обмена');
                                            }}
                                        >
                                            Копировать
                                        </button>
                                    </div>
                                    {expiresAt && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            Действителен до: {formatExpiryDate(expiresAt)}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col space-y-3">
                                    <a
                                        href={getTelegramLink()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
                                    >
                                        <FaTelegram className="text-lg" />
                                        <span>Открыть Telegram и верифицировать</span>
                                    </a>

                                    <button
                                        type="button"
                                        className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                        onClick={checkVerificationStatus}
                                    >
                                        Проверить статус верификации
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
                                onClick={generateVerificationCode}
                                disabled={loading}
                            >
                                <FaTelegram className="text-lg" />
                                <span>{loading ? 'Генерация кода...' : 'Сгенерировать код верификации'}</span>
                            </button>
                        )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium mb-2">Как верифицировать аккаунт:</h4>
                        <ol className="list-decimal list-inside text-sm space-y-2 text-gray-600 dark:text-gray-400">
                            <li>Нажмите кнопку "Сгенерировать код верификации"</li>
                            <li>Откройте Telegram и найдите нашего бота: @{botUsername || 'FranemaRentalBot'}</li>
                            <li>Отправьте боту команду /start с вашим кодом верификации</li>
                            <li>После успешной верификации обновите эту страницу</li>
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
} 