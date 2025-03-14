import { Database } from '@/types/supabase';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Создает клиентский Supabase клиент для использования в браузере
 * Используется в клиентских компонентах
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// Для обратной совместимости
export const createClientSupabaseClient = () => {
    return createClient();
}; 