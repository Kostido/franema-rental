create type verification_status as enum ('pending', 'verified', 'rejected');

create table telegram_users (
  id uuid primary key default uuid_generate_v4(),
  telegram_id bigint unique not null,
  username text,
  first_name text not null,
  last_name text,
  verification_status verification_status not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Создаем связь с таблицей users
alter table users add column telegram_user_id uuid references telegram_users(id);
alter table users add column is_telegram_verified boolean default false;

-- Создаем триггер для обновления updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_telegram_users_updated_at
  before update on telegram_users
  for each row
  execute function update_updated_at_column(); 