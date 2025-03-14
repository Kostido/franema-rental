import { createServerSupabaseClient } from '@/lib/supabase/server';
import { unauthorizedResponse, forbiddenResponse } from './api-response';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/types/supabase';

/**
 * Проверяет, авторизован ли пользователь
 * @returns Объект с данными пользователя или null, если пользователь не авторизован
 */
export async function getCurrentUser() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return null;
    }

    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    return user;
}

/**
 * Middleware для проверки авторизации пользователя
 * @param handler Обработчик запроса
 * @returns Результат обработчика или ошибку авторизации
 */
export function withAuth<T>(
    handler: (req: NextRequest, user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => Promise<NextResponse<T>>
) {
    return async (req: NextRequest) => {
        const user = await getCurrentUser();

        if (!user) {
            return unauthorizedResponse();
        }

        return handler(req, user);
    };
}

/**
 * Middleware для проверки роли пользователя
 * @param handler Обработчик запроса
 * @param allowedRoles Разрешенные роли
 * @returns Результат обработчика или ошибку доступа
 */
export function withRole<T>(
    handler: (req: NextRequest, user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => Promise<NextResponse<T>>,
    allowedRoles: UserRole[]
) {
    return withAuth(async (req, user) => {
        if (!allowedRoles.includes(user.role)) {
            return forbiddenResponse() as NextResponse<T>;
        }

        return handler(req, user);
    });
}

/**
 * Middleware для проверки роли администратора
 * @param handler Обработчик запроса
 * @returns Результат обработчика или ошибку доступа
 */
export function withAdmin<T>(
    handler: (req: NextRequest, user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => Promise<NextResponse<T>>
) {
    return withRole(handler, ['ADMIN']);
}

/**
 * Middleware для проверки роли администратора или менеджера
 * @param handler Обработчик запроса
 * @returns Результат обработчика или ошибку доступа
 */
export function withAdminOrManager<T>(
    handler: (req: NextRequest, user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => Promise<NextResponse<T>>
) {
    return withRole(handler, ['ADMIN', 'MANAGER']);
} 