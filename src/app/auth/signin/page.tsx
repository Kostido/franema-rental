'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import TelegramLoginButton from '@/components/auth/TelegramLoginButton';

export default function SignIn() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const [error, setError] = useState<string | null>(null);
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    useEffect(() => {
        // Если пользователь уже аутентифицирован, перенаправляем его
        if (status === 'authenticated') {
            router.push(callbackUrl);
        }

        // Проверяем наличие ошибки в URL
        const errorParam = searchParams.get('error');
        if (errorParam) {
            switch (errorParam) {
                case 'Callback':
                    setError('Произошла ошибка при аутентификации через Telegram');
                    break;
                default:
                    setError('Произошла неизвестная ошибка при входе');
            }
        }
    }, [status, router, callbackUrl, searchParams]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Вход в систему
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Используйте свой аккаунт Telegram для входа
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 mt-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                    <TelegramLoginButton
                        botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || ''}
                        buttonSize="large"
                        cornerRadius={8}
                        showUserPhoto={true}
                    />
                </div>
            </div>
        </div>
    );
} 