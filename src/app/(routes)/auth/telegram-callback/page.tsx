'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function TelegramCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        async function handleTelegramData() {
            try {
                setStatus('loading');

                // Отправляем запрос на API-маршрут с параметрами из URL
                const params = new URLSearchParams();
                for (const [key, value] of searchParams.entries()) {
                    params.append(key, value);
                }

                // Если есть данные от Telegram, обрабатываем их
                if (params.has('id') && params.has('hash')) {
                    const response = await fetch(`/api/auth/telegram-callback?${params.toString()}`);

                    if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.message || 'Ошибка авторизации через Telegram');
                    }

                    // Обновляем сессию Supabase
                    const supabase = createClient();
                    await supabase.auth.refreshSession();

                    setStatus('success');

                    // Редирект на профиль пользователя
                    setTimeout(() => {
                        router.push('/profile');
                    }, 2000);
                } else {
                    // Если данные отсутствуют, это может быть отмена авторизации
                    setStatus('error');
                    setError('Не получены данные для авторизации через Telegram');

                    // Редирект на страницу входа
                    setTimeout(() => {
                        router.push('/auth/login');
                    }, 2000);
                }
            } catch (err: any) {
                console.error('Ошибка авторизации через Telegram:', err);
                setStatus('error');
                setError(err.message || 'Произошла ошибка при авторизации через Telegram');

                // Редирект на страницу входа с ошибкой
                setTimeout(() => {
                    router.push(`/auth/login?error=${encodeURIComponent(err.message || 'Ошибка авторизации')}`);
                }, 2000);
            }
        }

        handleTelegramData();
    }, [searchParams, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {status === 'loading' && 'Обработка авторизации'}
                        {status === 'success' && 'Успешная авторизация'}
                        {status === 'error' && 'Ошибка авторизации'}
                    </h1>
                </div>

                {status === 'loading' && (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-600">Подождите, обрабатываем данные от Telegram...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <p className="text-gray-600">Вы успешно авторизовались через Telegram!</p>
                        <p className="text-gray-500 text-sm">Сейчас вы будете перенаправлены на страницу профиля...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <p className="text-red-600">{error || 'Произошла ошибка при авторизации через Telegram'}</p>
                        <p className="text-gray-500 text-sm">Сейчас вы будете перенаправлены на страницу входа...</p>
                    </div>
                )}
            </div>
        </div>
    );
} 