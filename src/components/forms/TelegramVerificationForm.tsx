'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function TelegramVerificationForm() {
    const [verificationCode, setVerificationCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const generateVerificationCode = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Получаем текущего пользователя
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    throw new Error('Пользователь не авторизован');
                }

                // Проверяем, есть ли уже код верификации
                const { data: existingCodes, error: fetchError } = await supabase
                    .from('telegram_verifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (fetchError) {
                    throw fetchError;
                }

                // Если код уже существует и не истек, используем его
                if (existingCodes && existingCodes.length > 0) {
                    const existingCode = existingCodes[0];
                    const expiresAt = new Date(existingCode.expires_at);

                    if (existingCode.is_verified) {
                        setIsVerified(true);
                        setVerificationCode(null);
                    } else if (expiresAt > new Date()) {
                        setVerificationCode(existingCode.verification_code);
                    } else {
                        // Код истек, создаем новый
                        await createNewCode(user.id);
                    }
                } else {
                    // Код не существует, создаем новый
                    await createNewCode(user.id);
                }
            } catch (error: any) {
                setError(error.message || 'Произошла ошибка при генерации кода верификации');
            } finally {
                setIsLoading(false);
            }
        };

        const createNewCode = async (userId: string) => {
            // Генерируем случайный код
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            // Устанавливаем срок действия кода (24 часа)
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            // Сохраняем код в базе данных
            const { error: insertError } = await supabase
                .from('telegram_verifications')
                .insert({
                    user_id: userId,
                    verification_code: code,
                    is_verified: false,
                    expires_at: expiresAt.toISOString(),
                });

            if (insertError) {
                throw insertError;
            }

            setVerificationCode(code);
        };

        generateVerificationCode();

        // Настраиваем интервал для проверки статуса верификации
        const checkVerificationStatus = setInterval(async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data: verifications, error: fetchError } = await supabase
                        .from('telegram_verifications')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (fetchError) {
                        throw fetchError;
                    }

                    if (verifications && verifications.length > 0 && verifications[0].is_verified) {
                        setIsVerified(true);
                        setVerificationCode(null);
                        clearInterval(checkVerificationStatus);
                    }
                }
            } catch (error) {
                console.error('Ошибка при проверке статуса верификации:', error);
            }
        }, 5000); // Проверяем каждые 5 секунд

        return () => {
            clearInterval(checkVerificationStatus);
        };
    }, [supabase]);

    const handleContinue = () => {
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (isVerified) {
        return (
            <div className="text-center space-y-4">
                <div className="bg-green-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium text-green-800">Верификация успешна!</h3>
                    <p className="text-green-700">Ваш аккаунт успешно связан с Telegram.</p>
                </div>
                <button
                    onClick={handleContinue}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Продолжить
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-blue-800">Верификация через Telegram</h3>
                <p className="text-blue-700 mt-1">
                    Для завершения регистрации необходимо связать ваш аккаунт с Telegram.
                </p>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                </div>
            )}

            {verificationCode && (
                <div className="space-y-4">
                    <div className="border rounded-md p-4 bg-gray-50">
                        <p className="text-sm text-gray-700 mb-2">Ваш код верификации:</p>
                        <div className="bg-white p-3 rounded border text-center">
                            <span className="text-xl font-mono font-bold tracking-wider">{verificationCode}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-700">
                            Отправьте этот код нашему боту в Telegram, чтобы завершить верификацию:
                        </p>

                        <a
                            href="https://t.me/franema_rental_bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <span className="mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                            </span>
                            Открыть Telegram бота
                        </a>
                    </div>

                    <div className="text-sm text-gray-500 mt-4">
                        <p>Код действителен в течение 24 часов. После верификации вы будете получать уведомления о бронированиях через Telegram.</p>
                    </div>
                </div>
            )}
        </div>
    );
} 