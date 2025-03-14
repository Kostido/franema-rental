import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { createBrowserClient } from '@supabase/ssr';

// Клиент для использования в клиентских компонентах
export const createClient = () => {
    return createClientComponentClient<Database>();
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