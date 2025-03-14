import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Интерфейс для данных пользователя Telegram
interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

// Функция для проверки подписи данных от Telegram
function verifyTelegramData(data: Omit<TelegramUser, 'hash'>, hash: string): boolean {
    // Получаем токен бота из переменных окружения
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        throw new Error('TELEGRAM_BOT_TOKEN не настроен');
    }

    // Создаем секретный ключ на основе токена бота
    const secretKey = crypto
        .createHash('sha256')
        .update(botToken)
        .digest();

    // Сортируем поля в алфавитном порядке и создаем строку данных
    const dataCheckString = Object.entries(data)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    // Вычисляем HMAC-SHA-256 подпись
    const computedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    // Сравниваем вычисленную подпись с полученной
    return computedHash === hash;
}

export async function POST(request: NextRequest) {
    try {
        // Получаем данные пользователя Telegram из запроса
        const userData: TelegramUser = await request.json();

        // Проверяем, что данные не устарели (не старше 24 часов)
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - userData.auth_date > 86400) {
            return NextResponse.json(
                { message: 'Данные авторизации устарели' },
                { status: 401 }
            );
        }

        // Отделяем хеш от остальных данных
        const { hash, ...dataWithoutHash } = userData;

        // Проверяем подпись данных
        if (!verifyTelegramData(dataWithoutHash, hash)) {
            return NextResponse.json(
                { message: 'Недействительная подпись данных' },
                { status: 401 }
            );
        }

        // Создаем клиент Supabase с сервисной ролью для управления пользователями
        const supabase = await createServiceRoleClient();

        // Проверяем, существует ли пользователь с таким Telegram ID
        const { data: existingTelegramUser } = await supabase
            .from('telegram_users')
            .select('*, users(*)')
            .eq('telegram_id', userData.id)
            .single();

        let userId: string;
        let session;

        if (existingTelegramUser) {
            // Если пользователь существует, обновляем его данные
            userId = existingTelegramUser.users.id;

            // Обновляем данные пользователя Telegram
            await supabase
                .from('telegram_users')
                .update({
                    username: userData.username,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    photo_url: userData.photo_url,
                    auth_date: new Date(userData.auth_date * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('telegram_id', userData.id);

            // Получаем существующую сессию пользователя
            const { data: sessionData } = await supabase.auth.admin.createSession({
                user_id: userId,
                expires_in: 60 * 60 * 24 * 7 // 7 дней
            });

            session = sessionData;
        } else {
            // Если пользователя нет, создаем нового пользователя
            // Генерируем случайный email и пароль для Supabase Auth
            const randomEmail = `telegram_${userData.id}_${Math.random().toString(36).substring(2)}@franema-rental.com`;
            const randomPassword = crypto.randomBytes(32).toString('hex');

            // Создаем нового пользователя в Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: randomEmail,
                password: randomPassword,
                email_confirm: true,
                user_metadata: {
                    telegram_id: userData.id,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    username: userData.username
                }
            });

            if (authError || !authData.user) {
                throw new Error(authError?.message || 'Ошибка создания пользователя');
            }

            userId = authData.user.id;

            // Создаем запись в таблице users
            await supabase.from('users').insert({
                id: userId,
                email: randomEmail,
                full_name: `${userData.first_name} ${userData.last_name || ''}`.trim(),
                role: 'user',
                is_verified: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            // Создаем запись в таблице telegram_users
            await supabase.from('telegram_users').insert({
                telegram_id: userData.id,
                user_id: userId,
                username: userData.username,
                first_name: userData.first_name,
                last_name: userData.last_name,
                photo_url: userData.photo_url,
                auth_date: new Date(userData.auth_date * 1000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            // Создаем сессию для нового пользователя
            const { data: sessionData } = await supabase.auth.admin.createSession({
                user_id: userId,
                expires_in: 60 * 60 * 24 * 7 // 7 дней
            });

            session = sessionData;
        }

        // Возвращаем данные сессии
        return NextResponse.json({ session });
    } catch (error: any) {
        console.error('Ошибка авторизации через Telegram:', error);
        return NextResponse.json(
            { message: error.message || 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
} 