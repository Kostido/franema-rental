'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface TelegramAccountInfoProps {
    telegramUser: {
        telegram_id: number;
        username?: string;
        first_name: string;
        last_name?: string;
        photo_url?: string;
    } | null;
}

export default function TelegramAccountInfo({ telegramUser }: TelegramAccountInfoProps) {
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleDisconnect = async () => {
        try {
            setIsDisconnecting(true);

            // Отключаем Telegram-аккаунт
            const { error: updateUserError } = await supabase
                .from('users')
                .update({
                    telegram_id: null,
                    is_verified: false
                })
                .eq('id', (await supabase.auth.getUser()).data.user?.id);

            if (updateUserError) {
                throw new Error(updateUserError.message || 'Ошибка при отключении Telegram-аккаунта');
            }

            // Удаляем запись из таблицы telegram_users
            const { error: deleteTelegramUserError } = await supabase
                .from('telegram_users')
                .delete()
                .eq('telegram_id', telegramUser?.telegram_id);

            if (deleteTelegramUserError) {
                throw new Error(deleteTelegramUserError.message || 'Ошибка при удалении Telegram-аккаунта');
            }

            toast.success('Telegram-аккаунт успешно отключен');
            router.refresh();
        } catch (error: any) {
            console.error('Ошибка при отключении Telegram-аккаунта:', error);
            toast.error(error.message || 'Произошла ошибка при отключении Telegram-аккаунта');
        } finally {
            setIsDisconnecting(false);
        }
    };

    if (!telegramUser) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Подключенный Telegram-аккаунт</h3>

            <div className="flex items-center gap-4 mb-4">
                {telegramUser.photo_url ? (
                    <Image
                        src={telegramUser.photo_url}
                        alt={`${telegramUser.first_name} ${telegramUser.last_name || ''}`}
                        width={64}
                        height={64}
                        className="rounded-full"
                    />
                ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-500 text-xl font-bold">
                            {telegramUser.first_name.charAt(0)}
                            {telegramUser.last_name ? telegramUser.last_name.charAt(0) : ''}
                        </span>
                    </div>
                )}

                <div>
                    <h4 className="font-medium">
                        {telegramUser.first_name} {telegramUser.last_name || ''}
                    </h4>
                    {telegramUser.username && (
                        <p className="text-gray-600">@{telegramUser.username}</p>
                    )}
                    <p className="text-sm text-gray-500">ID: {telegramUser.telegram_id}</p>
                </div>
            </div>

            <Button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                variant="destructive"
                className="w-full"
            >
                {isDisconnecting ? 'Отключение...' : 'Отключить Telegram-аккаунт'}
            </Button>
        </div>
    );
} 