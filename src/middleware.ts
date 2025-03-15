import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Получаем токен сессии NextAuth
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // Маршруты, требующие аутентификации
    const protectedRoutes = [
        '/profile',
        '/bookings',
        '/admin',
    ];

    // Маршруты только для гостей (неаутентифицированных пользователей)
    const guestRoutes = [
        '/auth/signin',
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
    if (isProtectedRoute && !token) {
        const redirectUrl = new URL('/auth/signin', request.url);
        redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Если маршрут только для гостей и пользователь аутентифицирован, перенаправляем на главную страницу
    if (isGuestRoute && token) {
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