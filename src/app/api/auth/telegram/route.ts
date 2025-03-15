import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createServerSupabaseClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { TelegramUser } from '@/types/telegram';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { AuthDataValidator, objectToAuthDataMap, TelegramUserData } from '@telegram-auth/server';
import { cookies } from 'next/headers';

// Инициализация Supabase клиента
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN!;

const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

// Функция для проверки подписи данных от Telegram
function verifyTelegramData(telegramData: TelegramUser): boolean {
    // Создаем строку для проверки
    const dataCheckString = Object.entries(telegramData)
        .filter(([key]) => key !== 'hash')
        .sort()
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    // Создаем секретный ключ на основе токена бота
    const secretKey = crypto
        .createHash('sha256')
        .update(telegramBotToken)
        .digest();

    // Вычисляем хеш
    const hash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    // Сравниваем вычисленный хеш с полученным
    return hash === telegramData.hash;
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Валидируем данные, полученные от Telegram Login Widget
        const validator = new AuthDataValidator({
            botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        });

        // Преобразуем данные в формат для валидатора
        const authData = objectToAuthDataMap(data);

        // Проверяем подлинность данных
        const telegramUser = await validator.validate(authData).catch((error) => {
            console.error('Telegram auth validation error:', error);
            return null;
        });

        if (!telegramUser) {
            return NextResponse.json({ error: 'Ошибка верификации данных Telegram' }, { status: 400 });
        }

        // Создаем клиент Supabase
        const supabase = await createServerSupabaseClient();

        // Получаем текущего пользователя
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Пользователь не авторизован' }, { status: 401 });
        }

        // Проверяем, существует ли запись о пользователе Telegram
        const { data: existingTelegramUser, error: findError } = await supabase
            .from('telegram_users')
            .select('*')
            .eq('telegram_id', telegramUser.id)
            .maybeSingle();

        if (findError) {
            console.error('Error finding telegram user:', findError);
        }

        // Если запись существует и привязана к другому пользователю
        if (existingTelegramUser && existingTelegramUser.user_id !== user.id) {
            return NextResponse.json(
                { error: 'Этот Telegram аккаунт уже привязан к другому пользователю' },
                { status: 409 }
            );
        }

        // Сохраняем или обновляем данные пользователя Telegram
        const telegramUserData = {
            telegram_id: telegramUser.id,
            user_id: user.id,
            username: telegramUser.username || null,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name || null,
            photo_url: telegramUser.photo_url || null,
            auth_date: new Date(),
        };

        const { error: upsertError } = await supabase
            .from('telegram_users')
            .upsert(telegramUserData, { onConflict: 'telegram_id' })
            .select();

        if (upsertError) {
            console.error('Error upserting telegram user:', upsertError);
            return NextResponse.json(
                { error: 'Ошибка сохранения данных пользователя Telegram' },
                { status: 500 }
            );
        }

        // Обновляем флаг верификации в таблице пользователей
        const { error: updateError } = await supabase
            .from('users')
            .update({
                telegram_id: telegramUser.id.toString(),
                is_verified: true,
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error updating user verification:', updateError);
            return NextResponse.json(
                { error: 'Ошибка обновления статуса верификации пользователя' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                telegram_id: telegramUser.id,
                username: telegramUser.username,
                first_name: telegramUser.first_name,
                last_name: telegramUser.last_name,
                photo_url: telegramUser.photo_url,
                is_verified: true,
            },
        });
    } catch (error) {
        console.error('Telegram auth error:', error);
        return NextResponse.json(
            { error: 'Произошла ошибка при обработке запроса' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();

        // Получаем текущего пользователя
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Пользователь не авторизован' }, { status: 401 });
        }

        // Получаем данные о Telegram-аккаунте пользователя
        const { data: telegramUser, error } = await supabase
            .from('telegram_users')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) {
            console.error('Error fetching telegram user:', error);
            return NextResponse.json(
                { error: 'Ошибка получения данных пользователя Telegram' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            telegramUser,
        });
    } catch (error) {
        console.error('Error fetching telegram auth state:', error);
        return NextResponse.json(
            { error: 'Произошла ошибка при обработке запроса' },
            { status: 500 }
        );
    }
}

// Функция для создания JWT-токена
function createJWT(userId: string, email: string, role: string): string {
    const payload = {
        sub: userId,
        email,
        role,
        aud: 'authenticated',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 дней
    };

    const secret = process.env.SUPABASE_JWT_SECRET || '';
    if (!secret) {
        throw new Error('SUPABASE_JWT_SECRET не настроен');
    }

    return jwt.sign(payload, secret);
} 