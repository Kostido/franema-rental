'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Metadata } from 'next';
import TelegramAccountInfo from '@/components/profile/TelegramAccountInfo';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Профиль | Franema Rental',
    description: 'Управление профилем пользователя и настройками аккаунта',
};

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUserData() {
            if (status === 'authenticated' && session?.user) {
                try {
                    const supabase = createClient();
                    const { data, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('telegram_id', session.user.id)
                        .single();

                    if (error) {
                        console.error('Ошибка при получении данных пользователя:', error);
                    } else {
                        setUserData(data);
                    }
                } catch (error) {
                    console.error('Ошибка при запросе данных пользователя:', error);
                } finally {
                    setLoading(false);
                }
            } else if (status !== 'loading') {
                setLoading(false);
            }
        }

        fetchUserData();
    }, [session, status]);

    if (status === 'loading' || loading) {
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
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Профиль пользователя</h1>

                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {session?.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || 'Пользователь'}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-8 w-8 text-gray-500"
                                >
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{session?.user?.name}</h2>
                            <p className="text-gray-600">ID: {session?.user?.id}</p>
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-lg font-medium mb-3">Данные из Supabase</h3>
                        {userData ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Имя</p>
                                    <p>{userData.first_name} {userData.last_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Telegram ID</p>
                                    <p>{userData.telegram_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Статус верификации</p>
                                    <p>{userData.is_verified ? 'Верифицирован' : 'Не верифицирован'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Дата регистрации</p>
                                    <p>{new Date(userData.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-600">Данные пользователя не найдены в базе данных.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 