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

        // Удаляем символ @ и пробелы из имени бота
        const cleanBotName = botName.replace(/^@/, '').trim();

        console.log(`Попытка #${loadAttempts + 1} инициализации Telegram Login Widget с именем бота:`, cleanBotName);

        // Создаем кастомную кнопку для авторизации через Telegram
        const createCustomButton = () => {
            if (!containerRef.current) return;

            // Очищаем контейнер
            containerRef.current.innerHTML = '';

            const customButton = document.createElement('button');
            customButton.className = 'flex items-center justify-center gap-2 py-2 px-4 bg-[#54A9EB] hover:bg-[#4A96D2] text-white rounded-md transition-colors w-full max-w-[280px]';

            const telegramIcon = document.createElement('span');
            telegramIcon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.9 8.5L15.08 16.32C15 16.85 14.6 17 14.17 16.79L11.53 14.86L10.25 16.09C10.16 16.18 10.08 16.26 9.91 16.26L10.02 13.56L15.14 8.96C15.29 8.82 15.11 8.74 14.91 8.88L8.61 12.74L6 11.97C5.48 11.8 5.47 11.35 6.12 11.1L16.17 7.11C16.61 6.95 17 7.29 16.9 8.5Z" fill="white"/></svg>';

            const buttonText = document.createElement('span');
            buttonText.textContent = 'Войти через Telegram';
            buttonText.className = 'font-medium';

            customButton.appendChild(telegramIcon);
            customButton.appendChild(buttonText);

            // Обработчик клика для перехода к авторизации через Telegram
            customButton.addEventListener('click', () => {
                const currentOrigin = encodeURIComponent(window.location.origin);

                // Проверяем, есть ли числовой идентификатор бота в переменных окружения
                const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID;

                if (botId) {
                    // Если идентификатор задан в переменных окружения, используем его напрямую
                    window.location.href = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${currentOrigin}&return_to=${currentOrigin}/auth/telegram-callback`;
                } else {
                    // Иначе получаем идентификатор через API
                    fetch(`/api/telegram/bot-info?bot_name=${encodeURIComponent(cleanBotName)}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.ok && data.bot_id) {
                                // Перенаправляем на авторизацию Telegram с числовым идентификатором
                                window.location.href = `https://oauth.telegram.org/auth?bot_id=${data.bot_id}&origin=${currentOrigin}&return_to=${currentOrigin}/auth/telegram-callback`;
                            } else {
                                // Если не удалось получить идентификатор, показываем ошибку
                                setError(`Не удалось получить идентификатор бота. ${data.error || ''}`);
                            }
                        })
                        .catch(err => {
                            console.error('Ошибка получения информации о боте:', err);
                            setError('Не удалось получить информацию о боте. Пожалуйста, попробуйте позже.');
                        });
                }
            });

            containerRef.current.appendChild(customButton);
        };

        // Функция для инициализации виджета через официальный скрипт (на случай если предпочтительнее использовать оригинальный виджет)
        const initWidgetWithScript = () => {
            if (!containerRef.current) return;

            // Функция обработки авторизации - не используется при редиректе, но определяем на всякий случай
            window.onTelegramAuth = (user: TelegramUser) => {
                console.log('Telegram авторизация получена через виджет:', user);
                // Здесь можно добавить обработку если необходимо
            };

            try {
                // Очищаем контейнер
                containerRef.current.innerHTML = '';

                // Добавляем div для виджета
                const widgetDiv = document.createElement('div');
                widgetDiv.id = 'telegram-login-' + cleanBotName;
                containerRef.current.appendChild(widgetDiv);

                // Создаем и добавляем скрипт для виджета Telegram
                const script = document.createElement('script');
                script.async = true;
                script.src = 'https://telegram.org/js/telegram-widget.js?22';

                // Используем data-атрибуты для настройки виджета
                script.dataset.telegramLogin = cleanBotName;
                script.dataset.size = 'large';
                script.dataset.radius = '8';
                script.dataset.userpic = 'true';
                script.dataset.onauth = 'onTelegramAuth(user)';

                // Добавляем атрибут origin, который необходим для работы виджета
                const currentOrigin = window.location.origin;
                script.dataset.origin = currentOrigin;

                console.log('Установлен origin для Telegram Login Widget:', currentOrigin);

                // Обработчик ошибок
                script.onerror = () => {
                    console.error('Ошибка загрузки скрипта Telegram Login Widget');

                    // Проверяем, есть ли на странице элемент с текстом "Origin required"
                    setTimeout(() => {
                        // Проверяем содержимое контейнера
                        if (containerRef.current && containerRef.current.textContent &&
                            containerRef.current.textContent.includes('Origin required')) {
                            setError(`Ошибка Origin: Домен ${window.location.origin} не добавлен в список разрешенных доменов в BotFather`);
                        } else {
                            setError('Ошибка загрузки виджета Telegram Login. Проверьте консоль для деталей.');
                        }

                        // Если скрипт не загрузился, используем кастомную кнопку
                        createCustomButton();
                    }, 1000); // Даем время на отрисовку ошибки
                };

                // Обработчик успешной загрузки
                script.onload = () => {
                    console.log('Скрипт Telegram Login Widget успешно загружен');
                };

                // Добавляем скрипт в контейнер
                containerRef.current.appendChild(script);

                console.log('Скрипт Telegram Login Widget добавлен в DOM');
            } catch (e) {
                console.error('Ошибка при инициализации виджета Telegram:', e);
                setError('Произошла ошибка при инициализации виджета Telegram.');
                createCustomButton();
            }
        };

        // Используем кастомную кнопку как основной вариант входа через Telegram
        createCustomButton();

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
                <div className="text-red-500 text-sm p-4 border border-red-200 rounded bg-red-50">
                    <p className="font-medium mb-2">{error}</p>

                    {error.includes('Origin') && (
                        <div className="text-xs text-gray-700 mb-2">
                            <p className="mb-1 font-semibold">Возможные причины:</p>
                            <ol className="list-decimal list-inside">
                                <li>Домен не добавлен в список разрешенных в BotFather</li>
                                <li>Неправильно настроены переменные окружения</li>
                            </ol>

                            <p className="mt-2 font-semibold">Решение:</p>
                            <ol className="list-decimal list-inside">
                                <li>Откройте BotFather в Telegram</li>
                                <li>Отправьте команду /setdomain</li>
                                <li>Выберите вашего бота</li>
                                <li>Добавьте текущий домен: {window.location.origin}</li>
                                <li>Для локальной разработки добавьте localhost</li>
                            </ol>
                        </div>
                    )}

                    <button
                        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        onClick={() => {
                            setError(null);
                            setLoadAttempts(prev => prev + 1);
                        }}
                    >
                        Попробовать снова
                    </button>
                </div>
            ) : (
                <div ref={containerRef} className="flex justify-center items-center min-h-[40px]">
                    <div className="text-gray-400 text-sm">Загрузка виджета Telegram...</div>
                </div>
            )}
        </div>
    );
} 