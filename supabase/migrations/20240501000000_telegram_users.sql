-- Создаем таблицу для хранения данных пользователей Telegram
CREATE TABLE IF NOT EXISTS telegram_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    photo_url TEXT,
    auth_date BIGINT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем индекс для быстрого поиска по telegram_id
CREATE INDEX IF NOT EXISTS idx_telegram_users_telegram_id ON telegram_users(telegram_id);

-- Настраиваем RLS (Row Level Security)
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;

-- Политика для чтения: все могут видеть данные пользователей
CREATE POLICY "Anyone can view telegram users"
    ON telegram_users
    FOR SELECT
    USING (true);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_telegram_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_telegram_users_updated_at
BEFORE UPDATE ON telegram_users
FOR EACH ROW
EXECUTE FUNCTION update_telegram_users_updated_at(); 