import { NextRequest, NextResponse } from 'next/server';

// Кэш для хранения идентификаторов ботов
const botIdCache: Record<string, number> = {};

export async function GET(request: NextRequest) {
    try {
        // Получаем имя бота из параметров запроса
        const searchParams = request.nextUrl.searchParams;
        const botName = searchParams.get('bot_name');

        if (!botName) {
            return NextResponse.json(
                { ok: false, error: 'Не указано имя бота' },
                { status: 400 }
            );
        }

        // Проверяем, есть ли идентификатор в кэше
        if (botIdCache[botName]) {
            return NextResponse.json({
                ok: true,
                bot_id: botIdCache[botName],
                bot_name: botName,
                from_cache: true
            });
        }

        // Получаем токен бота из переменных окружения
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            return NextResponse.json(
                { ok: false, error: 'Токен бота не настроен' },
                { status: 500 }
            );
        }

        // Получаем информацию о боте через Telegram API
        const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
        const data = await response.json();

        if (!data.ok) {
            return NextResponse.json(
                { ok: false, error: data.description || 'Не удалось получить информацию о боте' },
                { status: 500 }
            );
        }

        // Получаем идентификатор бота
        const botId = data.result.id;

        // Сохраняем идентификатор в кэше
        botIdCache[botName] = botId;

        return NextResponse.json({
            ok: true,
            bot_id: botId,
            bot_name: botName,
            bot_info: data.result
        });
    } catch (error: any) {
        console.error('Ошибка получения информации о боте:', error);
        return NextResponse.json(
            { ok: false, error: error.message || 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
} 