import { createClient } from '@/lib/supabase/server';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { objectToAuthDataMap, AuthDataValidator } from '@telegram-auth/server';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name: string;
            image: string;
            email: string;
        };
    }
}

// Функция для создания или обновления пользователя в Supabase
async function createUserOrUpdate(user: any) {
    const supabase = createClient();

    // Проверяем, существует ли пользователь
    const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', user.id.toString())
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Ошибка при поиске пользователя:', fetchError);
        throw fetchError;
    }

    const userData = {
        telegram_id: user.id.toString(),
        first_name: user.first_name,
        last_name: user.last_name || '',
        username: user.username || '',
        photo_url: user.photo_url || '',
        auth_date: user.auth_date,
        is_verified: true,
    };

    if (!existingUser) {
        // Создаем нового пользователя
        const { error: insertError } = await supabase
            .from('users')
            .insert([userData]);

        if (insertError) {
            console.error('Ошибка при создании пользователя:', insertError);
            throw insertError;
        }
    } else {
        // Обновляем существующего пользователя
        const { error: updateError } = await supabase
            .from('users')
            .update(userData)
            .eq('telegram_id', user.id.toString());

        if (updateError) {
            console.error('Ошибка при обновлении пользователя:', updateError);
            throw updateError;
        }
    }

    return userData;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'telegram-login',
            name: 'Telegram Login',
            credentials: {},
            async authorize(credentials, req) {
                const validator = new AuthDataValidator({
                    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
                });

                const data = objectToAuthDataMap(req.query || {});

                try {
                    const user = await validator.validate(data);

                    if (user.id && user.first_name) {
                        const returned = {
                            id: user.id.toString(),
                            email: user.id.toString(),
                            name: [user.first_name, user.last_name || ''].join(' ').trim(),
                            image: user.photo_url,
                        };

                        try {
                            await createUserOrUpdate(user);
                        } catch (error) {
                            console.error('Ошибка при создании/обновлении пользователя:', error);
                        }

                        return returned;
                    }
                } catch (error) {
                    console.error('Ошибка валидации данных Telegram:', error);
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async session({ session, user, token }) {
            session.user.id = session.user.email;
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 