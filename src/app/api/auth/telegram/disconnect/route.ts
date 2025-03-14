import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        // Создаем клиент Supabase с сервисной ролью
        const supabase = await createServiceRoleClient();

        // Получаем текущего пользователя
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { message: 'Пользователь не авторизован' },
                { status: 401 }
            );
        }

        // Получаем данные пользователя Telegram
        const { data: telegramUser } = await supabase
            .from('telegram_users')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!telegramUser) {
            return NextResponse.json(
                { message: 'Telegram-аккаунт не найден' },
                { status: 404 }
            );
        }

        // Удаляем запись из таблицы telegram_users
        const { error } = await supabase
            .from('telegram_users')
            .delete()
            .eq('telegram_id', telegramUser.telegram_id);

        if (error) {
            throw new Error(error.message);
        }

        // Обновляем метаданные пользователя
        await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: {
                telegram_id: null
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Ошибка при отключении Telegram-аккаунта:', error);
        return NextResponse.json(
            { message: error.message || 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
} 