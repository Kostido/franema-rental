import { Metadata } from 'next';
import Link from 'next/link';
import TelegramVerificationForm from '@/components/forms/TelegramVerificationForm';

export const metadata: Metadata = {
    title: 'Верификация через Telegram | Franema Rental',
    description: 'Верифицируйте ваш аккаунт через Telegram',
};

export default function VerifyTelegramPage() {
    return (
        <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Верификация через Telegram
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Свяжите ваш аккаунт с Telegram для получения уведомлений
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <TelegramVerificationForm />

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">Или</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <Link
                                href="/"
                                className="text-sm text-center text-indigo-600 hover:text-indigo-500"
                            >
                                Пропустить (вы сможете верифицировать аккаунт позже)
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 