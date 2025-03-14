import { Metadata } from 'next';
import Link from 'next/link';
import TelegramLoginButton from '@/components/auth/TelegramLoginButton';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Вход | Franema Rental',
    description: 'Войдите в систему бронирования видеотехники через Telegram',
};

export default function LoginPage() {
    // Получаем имя бота из переменных окружения
    const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '';

    // Отладочная информация
    console.log('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME:', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME);

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
                    Вход в систему
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Войдите через Telegram для доступа к системе бронирования
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900">Вход через Telegram</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Быстрый и безопасный вход без пароля
                            </p>
                        </div>

                        {/* Отладочная информация */}
                        <div className="text-center text-xs text-gray-500 mb-2">
                            Имя бота: {botName ? botName : 'Не задано'}
                        </div>

                        {botName ? (
                            <div className="w-full flex justify-center py-4">
                                <TelegramLoginButton
                                    botName={botName}
                                    buttonSize="large"
                                    cornerRadius={8}
                                    showUserPhoto={true}
                                />
                            </div>
                        ) : (
                            <div className="text-center text-red-500">
                                Ошибка конфигурации Telegram бота. Пожалуйста, свяжитесь с администратором.
                            </div>
                        )}

                        <div className="w-full border-t border-gray-300 my-4" />

                        <div className="text-center text-sm">
                            <p className="text-gray-600">
                                У вас возникли проблемы со входом?
                            </p>
                            <Link
                                href="/contact"
                                className="font-medium text-indigo-600 hover:text-indigo-500 mt-1 inline-block"
                            >
                                Связаться с поддержкой
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 