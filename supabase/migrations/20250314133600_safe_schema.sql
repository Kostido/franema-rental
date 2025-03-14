-- Проверка и создание типов перечислений, если они не существуют
DO $$
BEGIN
    -- Проверка user_role
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'USER', 'MANAGER');
    END IF;
    
    -- Проверка equipment_category
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'equipment_category') THEN
        CREATE TYPE equipment_category AS ENUM ('CAMERA', 'LENS', 'LIGHTING', 'AUDIO', 'ACCESSORY', 'OTHER');
    END IF;
    
    -- Проверка booking_status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');
    END IF;
END
$$;

-- Проверка и создание таблиц, если они не существуют
DO $$
BEGIN
    -- Проверка таблицы users
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        CREATE TABLE users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            role user_role NOT NULL DEFAULT 'USER',
            telegram_id TEXT,
            is_verified BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    END IF;
    
    -- Проверка таблицы equipment
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'equipment') THEN
        CREATE TABLE equipment (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            category equipment_category NOT NULL,
            serial_number TEXT NOT NULL UNIQUE,
            is_available BOOLEAN NOT NULL DEFAULT TRUE,
            image_url TEXT,
            specifications JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    END IF;
    
    -- Проверка таблицы bookings
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings') THEN
        CREATE TABLE bookings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
            start_date TIMESTAMPTZ NOT NULL,
            end_date TIMESTAMPTZ NOT NULL,
            status booking_status NOT NULL DEFAULT 'PENDING',
            notes TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT valid_date_range CHECK (end_date > start_date)
        );
    END IF;
    
    -- Проверка таблицы telegram_verifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'telegram_verifications') THEN
        CREATE TABLE telegram_verifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            verification_code TEXT NOT NULL,
            is_verified BOOLEAN NOT NULL DEFAULT FALSE,
            telegram_id TEXT,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    END IF;
END
$$;

-- Проверка и создание индексов, если они не существуют
DO $$
BEGIN
    -- Индексы для таблицы bookings
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'bookings' AND indexname = 'idx_bookings_user_id') THEN
        CREATE INDEX idx_bookings_user_id ON bookings(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'bookings' AND indexname = 'idx_bookings_equipment_id') THEN
        CREATE INDEX idx_bookings_equipment_id ON bookings(equipment_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'bookings' AND indexname = 'idx_bookings_status') THEN
        CREATE INDEX idx_bookings_status ON bookings(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'bookings' AND indexname = 'idx_bookings_date_range') THEN
        CREATE INDEX idx_bookings_date_range ON bookings(start_date, end_date);
    END IF;
    
    -- Индексы для таблицы equipment
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'equipment' AND indexname = 'idx_equipment_category') THEN
        CREATE INDEX idx_equipment_category ON equipment(category);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'equipment' AND indexname = 'idx_equipment_availability') THEN
        CREATE INDEX idx_equipment_availability ON equipment(is_available);
    END IF;
    
    -- Индексы для таблицы telegram_verifications
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'telegram_verifications' AND indexname = 'idx_telegram_verifications_user_id') THEN
        CREATE INDEX idx_telegram_verifications_user_id ON telegram_verifications(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'telegram_verifications' AND indexname = 'idx_telegram_verifications_code') THEN
        CREATE INDEX idx_telegram_verifications_code ON telegram_verifications(verification_code);
    END IF;
END
$$;

-- Создание функции для обновления updated_at, если она не существует
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггеров, если они не существуют
DO $$
BEGIN
    -- Триггеры для таблицы users
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    END IF;
    
    -- Триггеры для таблицы equipment
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_equipment_updated_at') THEN
        CREATE TRIGGER update_equipment_updated_at
        BEFORE UPDATE ON equipment
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    END IF;
    
    -- Триггеры для таблицы bookings
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_updated_at') THEN
        CREATE TRIGGER update_bookings_updated_at
        BEFORE UPDATE ON bookings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    END IF;
    
    -- Триггеры для таблицы telegram_verifications
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_telegram_verifications_updated_at') THEN
        CREATE TRIGGER update_telegram_verifications_updated_at
        BEFORE UPDATE ON telegram_verifications
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    END IF;
END
$$;

-- Включение RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_verifications ENABLE ROW LEVEL SECURITY;

-- Создание функции для проверки доступности оборудования, если она не существует
CREATE OR REPLACE FUNCTION check_equipment_availability(
    equipment_id UUID,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    is_available BOOLEAN;
BEGIN
    SELECT NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.equipment_id = check_equipment_availability.equipment_id
        AND bookings.status IN ('PENDING', 'APPROVED')
        AND (
            exclude_booking_id IS NULL OR bookings.id != exclude_booking_id
        )
        AND (
            (bookings.start_date <= check_equipment_availability.end_date AND bookings.end_date >= check_equipment_availability.start_date)
        )
    ) INTO is_available;
    
    RETURN is_available;
END;
$$ LANGUAGE plpgsql; 