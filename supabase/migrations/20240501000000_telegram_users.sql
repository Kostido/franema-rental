-- Создаем таблицу для хранения данных пользователей Telegram
CREATE TABLE IF NOT EXISTS telegram_users (
    telegram_id BIGINT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    photo_url TEXT,
    auth_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_telegram_users_user_id ON telegram_users(user_id);

-- Настраиваем RLS (Row Level Security)
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;

-- Политика для чтения: пользователи могут видеть только свои данные
CREATE POLICY "Users can view their own telegram data"
    ON telegram_users
    FOR SELECT
    USING (auth.uid() = user_id);

-- Политика для администраторов: могут видеть все данные
CREATE POLICY "Admins can view all telegram data"
    ON telegram_users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

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