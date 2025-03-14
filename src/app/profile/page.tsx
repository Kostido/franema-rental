import { Metadata } from 'next';
import ProfileForm from '@/components/profile/ProfileForm';
import TelegramVerification from '@/components/profile/TelegramVerification';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
    title: 'Профиль | Franema Rental',
    description: 'Управление профилем пользователя и настройками аккаунта',
};

export default async function ProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    // Получаем данные пользователя из базы
    const { data: userData } = await supabase
        .from('users')
        .select('*, telegram_users(*)')
        .eq('id', user.id)
        .single();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Профиль пользователя</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-600">Email</label>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            {/* Добавьте здесь другие поля профиля */}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <TelegramVerification
                        userId={user.id}
                        isTelegramVerified={!!userData?.telegram_users}
                    />
                </div>
            </div>
        </div>
    );
} 