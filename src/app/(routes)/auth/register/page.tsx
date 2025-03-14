import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Регистрация | Franema Rental',
    description: 'Регистрация в системе бронирования видеотехники через Telegram',
};

export default function RegisterPage() {
    // Перенаправляем на страницу входа, так как теперь используется только Telegram
    redirect('/auth/login');

    // Этот код не будет выполнен из-за перенаправления, но оставлен для типизации
    return (
        <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-16 h-16 relative">
                        <Image
                            src="/logo.png"
                            alt="Franema Rental Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Регистрация
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Регистрация доступна только через Telegram
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">
                            Для регистрации и входа в систему используйте кнопку Telegram на странице входа
                        </p>
                        <Link
                            href="/auth/login"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Перейти на страницу входа
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 