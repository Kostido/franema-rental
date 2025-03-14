export const TELEGRAM_CONFIG = {
    BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN as string,
    WEBHOOK_URL: `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`,
    BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME as string,
    WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET as string,
}

export const TELEGRAM_COMMANDS = {
    START: '/start',
    VERIFY: '/verify',
    HELP: '/help',
} 