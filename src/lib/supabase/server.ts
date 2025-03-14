import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

/**
 * Создает серверный клиент Supabase с использованием cookies из запроса
 * Используется в серверных компонентах и API-маршрутах
 */
export async function createServerSupabaseClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: { path: string; maxAge: number; domain?: string; sameSite?: "lax" | "strict" | "none"; secure?: boolean }) {
                    cookieStore.set({
                        name,
                        value,
                        path: options.path,
                        maxAge: options.maxAge,
                        domain: options.domain,
                        sameSite: options.sameSite,
                        secure: options.secure
                    });
                },
                remove(name: string, options: { path: string; domain?: string; sameSite?: "lax" | "strict" | "none"; secure?: boolean }) {
                    cookieStore.set({
                        name,
                        value: '',
                        path: options.path,
                        maxAge: 0,
                        domain: options.domain,
                        sameSite: options.sameSite,
                        secure: options.secure
                    });
                },
            },
        }
    );
}

/**
 * Создает серверный клиент Supabase с использованием сервисной роли
 * Используется для операций, требующих повышенных привилегий
 */
export async function createServiceRoleSupabaseClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: { path: string; maxAge: number; domain?: string; sameSite?: "lax" | "strict" | "none"; secure?: boolean }) {
                    cookieStore.set({
                        name,
                        value,
                        path: options.path,
                        maxAge: options.maxAge,
                        domain: options.domain,
                        sameSite: options.sameSite,
                        secure: options.secure
                    });
                },
                remove(name: string, options: { path: string; domain?: string; sameSite?: "lax" | "strict" | "none"; secure?: boolean }) {
                    cookieStore.set({
                        name,
                        value: '',
                        path: options.path,
                        maxAge: 0,
                        domain: options.domain,
                        sameSite: options.sameSite,
                        secure: options.secure
                    });
                },
            },
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}

export function createClient() {
    const cookieStore = cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // Handle cookie errors in edge functions
                    }
                },
                remove(name: string, options: any) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // Handle cookie errors in edge functions
                    }
                },
            },
        }
    );
}

export async function createServiceRoleClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // Handle cookie errors
                    }
                },
                remove(name: string, options: any) {
                    try {
                        cookieStore.delete(name);
                    } catch (error) {
                        // Handle cookie errors
                    }
                },
            },
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
} 