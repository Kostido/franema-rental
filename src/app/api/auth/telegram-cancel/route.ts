import { NextRequest, NextResponse } from 'next/server';

/**
 * Обработчик отмены авторизации через Telegram
 * Этот маршрут вызывается, когда пользователь нажимает кнопку "Отмена" в интерфейсе Telegram
 */
export async function GET(request: NextRequest) {
    console.log('Получен запрос на отмену авторизации Telegram');

    // Получаем URL для перенаправления из параметров запроса или используем главную страницу по умолчанию
    const searchParams = request.nextUrl.searchParams;
    const redirectUrl = searchParams.get('redirect_url') || '/';

    console.log('Перенаправление на:', redirectUrl);

    // Перенаправляем пользователя на указанный URL
    return NextResponse.redirect(new URL(redirectUrl, request.url));
} 