'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/types';

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Получаем текущего пользователя из Supabase Auth
                const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

                if (authError) {
                    throw authError;
                }

                if (!authUser) {
                    setUser(null);
                    return;
                }

                // Получаем дополнительную информацию о пользователе из таблицы users
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (userError) {
                    throw userError;
                }

                // Преобразуем данные в формат User
                const fullUser: User = {
                    id: userData.id,
                    email: userData.email,
                    fullName: userData.full_name,
                    role: userData.role,
                    telegramId: userData.telegram_id || undefined,
                    isVerified: userData.is_verified,
                    createdAt: new Date(userData.created_at),
                    updatedAt: new Date(userData.updated_at),
                };

                setUser(fullUser);
            } catch (error: any) {
                console.error('Ошибка при получении пользователя:', error);
                setError(error.message || 'Произошла ошибка при получении данных пользователя');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        // Вызываем функцию при монтировании компонента
        fetchUser();

        // Подписываемся на изменения аутентификации
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                fetchUser();
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        // Отписываемся при размонтировании
        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    return { user, isLoading, error };
} 