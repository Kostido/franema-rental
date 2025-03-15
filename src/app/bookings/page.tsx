'use client';

import { useSession } from 'next-auth/react';

export default function BookingsPage() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Загрузка данных...</p>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <div className="bg-red-50 p-4 rounded-md">
                    <h2 className="text-red-800 text-lg font-medium">Доступ запрещен</h2>
                    <p className="text-red-600 mt-1">Вы должны войти в систему для просмотра этой страницы.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Мои бронирования</h1>

                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Список бронирований</h2>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Новое бронирование
                        </button>
                    </div>

                    <div className="border-t pt-4">
                        <div className="text-center py-8">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-16 w-16 mx-auto text-gray-400 mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">У вас пока нет бронирований</h3>
                            <p className="text-gray-500">Создайте новое бронирование, чтобы начать пользоваться сервисом</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 