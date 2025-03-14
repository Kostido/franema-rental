import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Получаем параметры из URL
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const firstName = searchParams.get('first_name');
        const lastName = searchParams.get('last_name');
        const username = searchParams.get('username');
        const photoUrl = searchParams.get('photo_url');
        const authDate = searchParams.get('auth_date');
        const hash = searchParams.get('hash');

        // Проверяем наличие обязательных параметров
        if (!id || !firstName || !authDate || !hash) {
            return NextResponse.json(
                { error: 'Неверные параметры авторизации' },
                { status: 400 }
            );
        }

        // Создаем объект с данными пользователя
        const telegramUser = {
            id: parseInt(id),
            first_name: firstName,
            last_name: lastName || undefined,
            username: username || undefined,
            photo_url: photoUrl || undefined,
            auth_date: parseInt(authDate),
            hash
        };

        // Отправляем данные на обработку в основной API авторизации Telegram
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/telegram`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(telegramUser),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.message || 'Ошибка авторизации' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Создаем HTML для установки токена в localStorage и перенаправления
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Авторизация через Telegram</title>
            <meta charset="utf-8">
        </head>
        <body>
            <h1>Авторизация успешна</h1>
            <p>Перенаправление...</p>
            <script>
                // Устанавливаем JWT-токен в localStorage
                localStorage.setItem('supabase.auth.token', JSON.stringify({
                    access_token: "${data.token}",
                    token_type: "bearer",
                    expires_at: ${Date.now() + 7 * 24 * 60 * 60 * 1000}
                }));
                
                // Перенаправляем на главную страницу
                window.location.href = '/profile';
            </script>
        </body>
        </html>
        `;

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html',
            },
        });
    } catch (error: any) {
        console.error('Ошибка обработки редиректа Telegram:', error);
        return NextResponse.json(
            { error: error.message || 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
} 