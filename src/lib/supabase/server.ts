import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

/**
 * Создает серверный клиент Supabase с использованием cookies из запроса
 * Используется в серверных компонентах и API-маршрутах
 */
export function createServerSupabaseClient() {
    const cookieStore = cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: { path: string; maxAge: number; domain?: string; sameSite?: string; secure?: boolean }) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: { path: string; domain?: string; sameSite?: string; secure?: boolean }) {
                    cookieStore.set({ name, value: '', ...options, maxAge: 0 });
                },
            },
        }
    );
}

/**
 * Создает серверный клиент Supabase с использованием сервисной роли
 * Используется для операций, требующих повышенных привилегий
 */
export function createServiceRoleSupabaseClient() {
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
} 