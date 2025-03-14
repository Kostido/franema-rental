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

        // Функция для инициализации виджета непосредственным добавлением iframe
        const initWidgetDirectly = () => {
            if (!containerRef.current) return;

            // Очищаем контейнер
            containerRef.current.innerHTML = '';

            // Создаем iframe напрямую (это обходной путь, если скрипт не работает)
            const iframe = document.createElement('iframe');
            iframe.style.border = 'none';
            iframe.scrolling = 'no';
            iframe.frameBorder = '0';
            iframe.allowFullscreen = true;
            iframe.width = '280';
            iframe.height = '40';

            // Используем прямую ссылку на iframe
            const currentOrigin = window.location.origin;
            console.log('Устанавливаем origin для iframe:', currentOrigin);

            iframe.src = `https://oauth.telegram.org/embed/${cleanBotName}?size=large&userpic=true&radius=8&onauth=onTelegramAuth&origin=${encodeURIComponent(currentOrigin)}`;
            containerRef.current.appendChild(iframe);

            // Добавляем обработчик для iframe, чтобы отловить ошибки
            iframe.onerror = () => {
                console.error('Ошибка загрузки iframe для Telegram Login');
                setError('Не удалось загрузить виджет входа через Telegram');
            };

            // Добавляем обработчик загрузки для проверки контента
            iframe.onload = () => {
                try {
                    // Проверяем, содержит ли iframe ошибку "Origin required"
                    setTimeout(() => {
                        if (iframe.contentDocument &&
                            iframe.contentDocument.body.textContent &&
                            iframe.contentDocument.body.textContent.includes('Origin required')) {
                            setError(`Ошибка Origin: Домен ${currentOrigin} не добавлен в список разрешенных доменов в BotFather`);
                        }
                    }, 500);
                } catch (e) {
                    // Ошибка доступа к contentDocument может возникнуть из-за политики Same-Origin
                    console.log('Невозможно проверить содержимое iframe из-за ограничений Same-Origin');
                }
            };

            console.log('Виджет Telegram Login добавлен как iframe');
        };

        // Функция для инициализации виджета через официальный скрипт
        const initWidgetWithScript = () => {
            if (!containerRef.current) return;

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

                        // Если скрипт не загрузился, используем iframe напрямую
                        initWidgetDirectly();
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

                // В случае ошибки пробуем прямую инициализацию через iframe
                initWidgetDirectly();
            }
        };

        // Инициализируем виджет с помощью официального скрипта
        initWidgetWithScript();

        // Устанавливаем таймер для проверки, загрузился ли виджет
        const checkTimer = setTimeout(() => {
            // Если контейнер существует и в нем нет iframe или кнопки входа
            if (containerRef.current &&
                !containerRef.current.querySelector('iframe') &&
                !containerRef.current.querySelector('button')) {

                console.log('Виджет не загрузился, пробуем прямую инициализацию');

                // Если виджет не загрузился, пробуем прямую инициализацию
                initWidgetDirectly();
            }
        }, 3000);

        // Очистка при размонтировании
        return () => {
            clearTimeout(checkTimer);
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