-- Удаление существующих политик, если они существуют
DO $$
BEGIN
    -- Удаление политик для таблицы users
    DROP POLICY IF EXISTS "Пользователи могут видеть только свой профиль" ON users;
    DROP POLICY IF EXISTS "Администраторы могут видеть все профили" ON users;
    DROP POLICY IF EXISTS "Пользователи могут обновлять только свой профиль" ON users;
    DROP POLICY IF EXISTS "Администраторы могут обновлять все профили" ON users;
    
    -- Удаление политик для таблицы equipment
    DROP POLICY IF EXISTS "Все могут просматривать оборудование" ON equipment;
    DROP POLICY IF EXISTS "Только администраторы и менеджеры могут добавлять оборудование" ON equipment;
    DROP POLICY IF EXISTS "Только администраторы и менеджеры могут обновлять оборудование" ON equipment;
    DROP POLICY IF EXISTS "Только администраторы и менеджеры могут удалять оборудование" ON equipment;
    DROP POLICY IF EXISTS "Только администраторы и менеджеры" ON equipment;
    
    -- Удаление политик для таблицы bookings
    DROP POLICY IF EXISTS "Пользователи могут видеть свои бронирования" ON bookings;
    DROP POLICY IF EXISTS "Администраторы и менеджеры могут видеть все бронирования" ON bookings;
    DROP POLICY IF EXISTS "Пользователи могут создавать бронирования" ON bookings;
    DROP POLICY IF EXISTS "Пользователи могут обновлять свои бронирования" ON bookings;
    DROP POLICY IF EXISTS "Администраторы и менеджеры могут обновлять все бронирования" ON bookings;
    DROP POLICY IF EXISTS "Пользователи могут удалять свои бронирования" ON bookings;
    DROP POLICY IF EXISTS "Администраторы и менеджеры могут удалять все бронирования" ON bookings;
    
    -- Удаление политик для таблицы telegram_verifications
    DROP POLICY IF EXISTS "Пользователи могут видеть свои верификации" ON telegram_verifications;
    DROP POLICY IF EXISTS "Пользователи могут создавать верификации" ON telegram_verifications;
    DROP POLICY IF EXISTS "Пользователи могут обновлять свои верификации" ON telegram_verifications;
    DROP POLICY IF EXISTS "Сервисная роль может обновлять верификации" ON telegram_verifications;
END
$$;

-- Создание новых политик для таблицы users
CREATE POLICY "users_select_own"
ON users FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

CREATE POLICY "admins_select_all_users"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  )
);

CREATE POLICY "users_update_own"
ON users FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
);

CREATE POLICY "admins_update_all_users"
ON users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  )
);

-- Создание новых политик для таблицы equipment
CREATE POLICY "equipment_select_all"
ON equipment FOR SELECT
TO authenticated
USING (
  TRUE
);

CREATE POLICY "equipment_insert_admin_manager"
ON equipment FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND (users.role = 'ADMIN' OR users.role = 'MANAGER')
  )
);

CREATE POLICY "equipment_update_admin_manager"
ON equipment FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND (users.role = 'ADMIN' OR users.role = 'MANAGER')
  )
);

CREATE POLICY "equipment_delete_admin_manager"
ON equipment FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND (users.role = 'ADMIN' OR users.role = 'MANAGER')
  )
);

-- Создание новых политик для таблицы bookings
CREATE POLICY "bookings_select_own"
ON bookings FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

CREATE POLICY "bookings_select_admin_manager"
ON bookings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND (users.role = 'ADMIN' OR users.role = 'MANAGER')
  )
);

CREATE POLICY "bookings_insert_own"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "bookings_update_own"
ON bookings FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
);

CREATE POLICY "bookings_update_admin_manager"
ON bookings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND (users.role = 'ADMIN' OR users.role = 'MANAGER')
  )
);

CREATE POLICY "bookings_delete_own"
ON bookings FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);

CREATE POLICY "bookings_delete_admin_manager"
ON bookings FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND (users.role = 'ADMIN' OR users.role = 'MANAGER')
  )
);

-- Создание новых политик для таблицы telegram_verifications
CREATE POLICY "telegram_verifications_select_own"
ON telegram_verifications FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

CREATE POLICY "telegram_verifications_insert_own"
ON telegram_verifications FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "telegram_verifications_update_own"
ON telegram_verifications FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
);

CREATE POLICY "telegram_verifications_update_service"
ON telegram_verifications FOR UPDATE
USING (
  (SELECT current_setting('role') = 'service_role')
); 