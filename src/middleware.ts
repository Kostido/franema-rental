import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const supabase = createMiddlewareClient<Database>({ req: request, res: response });

    // Обновление сессии, если она существует
    await supabase.auth.getSession();

    // Проверка аутентификации для защищенных маршрутов
    const { data: { session } } = await supabase.auth.getSession();

    // Маршруты, требующие аутентификации
    const protectedRoutes = [
        '/profile',
        '/bookings',
        '/admin',
    ];

    // Маршруты только для гостей (неаутентифицированных пользователей)
    const guestRoutes = [
        '/auth/login',
        '/auth/register',
    ];

    // Проверка, является ли текущий маршрут защищенным
    const isProtectedRoute = protectedRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    );

    // Проверка, является ли текущий маршрут только для гостей
    const isGuestRoute = guestRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    );

    // Если маршрут защищен и пользователь не аутентифицирован, перенаправляем на страницу входа
    if (isProtectedRoute && !session) {
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Если маршрут только для гостей и пользователь аутентифицирован, перенаправляем на главную страницу
    if (isGuestRoute && session) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
}

// Указываем, для каких маршрутов должен срабатывать middleware
export const config = {
    matcher: [
        '/profile/:path*',
        '/bookings/:path*',
        '/admin/:path*',
        '/auth/:path*',
    ],
}; 