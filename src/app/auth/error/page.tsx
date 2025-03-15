'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [errorMessage, setErrorMessage] = useState<string>('Произошла неизвестная ошибка при аутентификации');

    useEffect(() => {
        const error = searchParams.get('error');

        if (error) {
            switch (error) {
                case 'Configuration':
                    setErrorMessage('Ошибка конфигурации сервера. Пожалуйста, обратитесь к администратору.');
                    break;
                case 'AccessDenied':
                    setErrorMessage('Доступ запрещен. У вас нет прав для входа в систему.');
                    break;
                case 'Verification':
                    setErrorMessage('Ошибка верификации. Не удалось подтвердить ваши данные.');
                    break;
                case 'Callback':
                    setErrorMessage('Ошибка при обработке данных от Telegram. Пожалуйста, попробуйте снова.');
                    break;
                default:
                    setErrorMessage('Произошла ошибка при аутентификации. Пожалуйста, попробуйте снова.');
            }
        }
    }, [searchParams]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Ошибка аутентификации
                    </h2>
                </div>

                <div className="rounded-md bg-red-50 p-4 mt-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Произошла ошибка</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{errorMessage}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <Link
                        href="/auth/signin"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Вернуться на страницу входа
                    </Link>
                </div>
            </div>
        </div>
    );
} 