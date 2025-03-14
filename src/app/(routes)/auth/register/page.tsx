import { Metadata } from 'next';
import Link from 'next/link';
import RegisterForm from '@/components/forms/RegisterForm';

export const metadata: Metadata = {
    title: 'Регистрация | Franema Rental',
    description: 'Зарегистрируйтесь в системе бронирования видеотехники',
};

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Регистрация
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Уже есть аккаунт?{' '}
                    <Link
                        href="/auth/login"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Войдите
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <RegisterForm />

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">Важная информация</span>
                            </div>
                        </div>

                        <div className="mt-6 text-sm text-gray-500">
                            <p>
                                После регистрации вам потребуется верифицировать аккаунт через Telegram для получения уведомлений о бронировании.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 