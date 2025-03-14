import { Metadata } from 'next';
import ProfileForm from '@/components/profile/ProfileForm';
import TelegramVerification from '@/components/profile/TelegramVerification';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
    title: 'Профиль | Franema Rental',
    description: 'Управление профилем пользователя и настройками аккаунта',
};

export default async function ProfilePage() {
    // Получаем данные пользователя из сессии
    const supabase = await createServerSupabaseClient();

    // Получаем текущего пользователя
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/auth/login?callbackUrl=/profile');
    }

    // Получаем данные профиля
    const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (error || !profile) {
        console.error('Ошибка при получении профиля:', error);
        redirect('/auth/login?callbackUrl=/profile');
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Профиль пользователя</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-6">Личные данные</h2>
                    <ProfileForm initialData={profile} />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-6">Верификация Telegram</h2>
                    <TelegramVerification
                        isVerified={profile.is_verified}
                        telegramId={profile.telegram_id}
                    />
                </div>
            </div>
        </div>
    );
} 