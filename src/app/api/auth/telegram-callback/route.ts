import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { TelegramUser } from '@/types/telegram';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Инициализация Supabase клиента
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Функция для проверки подписи данных от Telegram
function verifyTelegramData(telegramData: TelegramUser): boolean {
    // Создаем строку для проверки
    const dataCheckString = Object.entries(telegramData)
        .filter(([key]) => key !== 'hash')
        .sort()
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    console.log('Строка для проверки:', dataCheckString);

    // Создаем секретный ключ на основе токена бота и строки "WebAppData"
    // Это соответствует официальной документации Telegram и примеру PHP-кода
    const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(telegramBotToken)
        .digest();

    console.log('Секретный ключ создан');

    // Вычисляем хеш
    const hash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    console.log('Вычисленный хеш:', hash);
    console.log('Полученный хеш:', telegramData.hash);

    // Сравниваем вычисленный хеш с полученным
    return hash === telegramData.hash;
}

export async function GET(request: NextRequest) {
    try {
        console.log('Получен запрос на обработку колбэка от Telegram');

        // Получаем параметры из URL
        const searchParams = request.nextUrl.searchParams;
        const params: Record<string, string> = {};

        // Собираем все параметры из URL
        for (const [key, value] of searchParams.entries()) {
            params[key] = value;
            console.log(`Параметр API: ${key} = ${value}`);
        }

        // Проверяем наличие обязательных параметров
        if (!params.id || !params.hash || !params.auth_date) {
            console.error('Отсутствуют обязательные параметры:', { id: !!params.id, hash: !!params.hash, auth_date: !!params.auth_date });
            return NextResponse.redirect(new URL('/auth/login?error=missing_telegram_data', request.url));
        }

        // Преобразуем параметры в объект TelegramUser
        const telegramData: TelegramUser = {
            id: parseInt(params.id),
            first_name: params.first_name,
            last_name: params.last_name,
            username: params.username,
            photo_url: params.photo_url,
            auth_date: parseInt(params.auth_date),
            hash: params.hash
        };

        console.log('Получены данные от Telegram:', telegramData);

        // Проверяем подлинность данных
        if (!verifyTelegramData(telegramData)) {
            console.error('Недействительные данные авторизации Telegram');
            return NextResponse.redirect(new URL('/auth/login?error=invalid_telegram_data', request.url));
        }

        // Проверяем, не устарели ли данные (не старше 24 часов)
        const authDate = telegramData.auth_date;
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - authDate > 86400) {
            console.error('Данные авторизации Telegram устарели');
            return NextResponse.redirect(new URL('/auth/login?error=expired_telegram_data', request.url));
        }

        // Создаем клиент Supabase с сервисной ролью для управления пользователями
        const supabase = await createServiceRoleClient();

        // Проверяем, существует ли пользователь с таким Telegram ID
        const { data: existingTelegramUser } = await supabase
            .from('telegram_users')
            .select('*, users(*)')
            .eq('telegram_id', telegramData.id)
            .single();

        let userId: string;

        if (existingTelegramUser) {
            // Если пользователь существует, обновляем его данные
            userId = existingTelegramUser.users.id;

            // Обновляем данные пользователя Telegram
            await supabase
                .from('telegram_users')
                .update({
                    username: telegramData.username,
                    first_name: telegramData.first_name,
                    last_name: telegramData.last_name,
                    photo_url: telegramData.photo_url,
                    auth_date: new Date(telegramData.auth_date * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('telegram_id', telegramData.id);

            // Получаем данные пользователя для создания JWT
            const { data: userInfo } = await supabase
                .from('users')
                .select('email, role')
                .eq('id', userId)
                .single();

            if (!userInfo) {
                throw new Error('Пользователь не найден');
            }

            // Создаем JWT-токен для пользователя
            const token = createJWT(userId, userInfo.email, userInfo.role);

            // Устанавливаем куки с токеном
            const response = NextResponse.redirect(new URL('/profile', request.url));
            response.cookies.set('supabase-auth-token', token, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 дней
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });

            return response;
        } else {
            // Если пользователя нет, создаем нового пользователя
            // Генерируем случайный email и пароль для Supabase Auth
            const randomEmail = `telegram_${telegramData.id}_${Math.random().toString(36).substring(2)}@franema-rental.com`;
            const randomPassword = crypto.randomBytes(32).toString('hex');

            // Создаем нового пользователя в Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: randomEmail,
                password: randomPassword,
                email_confirm: true,
                user_metadata: {
                    telegram_id: telegramData.id,
                    first_name: telegramData.first_name,
                    last_name: telegramData.last_name,
                    username: telegramData.username
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
                full_name: `${telegramData.first_name} ${telegramData.last_name || ''}`.trim(),
                role: 'user',
                is_verified: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            // Создаем запись в таблице telegram_users
            await supabase.from('telegram_users').insert({
                telegram_id: telegramData.id,
                user_id: userId,
                username: telegramData.username,
                first_name: telegramData.first_name,
                last_name: telegramData.last_name,
                photo_url: telegramData.photo_url,
                auth_date: new Date(telegramData.auth_date * 1000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            // Получаем данные пользователя для создания JWT
            const { data: userInfo } = await supabase
                .from('users')
                .select('email, role')
                .eq('id', userId)
                .single();

            if (!userInfo) {
                throw new Error('Пользователь не найден');
            }

            // Создаем JWT-токен для пользователя
            const token = createJWT(userId, userInfo.email, userInfo.role);

            // Устанавливаем куки с токеном
            const response = NextResponse.redirect(new URL('/profile', request.url));
            response.cookies.set('supabase-auth-token', token, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 дней
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });

            return response;
        }
    } catch (error: any) {
        console.error('Ошибка авторизации через Telegram:', error);
        return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message || 'Внутренняя ошибка сервера')}`, request.url));
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