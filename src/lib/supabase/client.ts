import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { createBrowserClient } from '@supabase/ssr';

// Клиент для использования в клиентских компонентах
export const createClient = () => {
    return createClientComponentClient<Database>();
};

// Клиент для использования в серверных компонентах
export const createServerClient = () => {
    const cookieStore = cookies();
    return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

// Клиент для использования в серверных экшенах и API роутах
export const createActionClient = async () => {
    'use server';

    const cookieStore = cookies();
    return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

/**
 * Создает клиентский Supabase клиент для использования в браузере
 * Используется в клиентских компонентах
 */
export function createClientSupabaseClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
} 