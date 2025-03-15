-- Create telegram_verifications table
create table if not exists public.telegram_verifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    telegram_id bigint not null,
    verification_code text not null,
    status text not null check (status in ('pending', 'verified', 'expired')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    expires_at timestamp with time zone not null,
    verified_at timestamp with time zone
);

-- Add RLS policies
alter table public.telegram_verifications enable row level security;

create policy "Users can view their own verifications"
    on public.telegram_verifications for select
    using (auth.uid() = user_id);

create policy "Users can update their own verifications"
    on public.telegram_verifications for update
    using (auth.uid() = user_id); 