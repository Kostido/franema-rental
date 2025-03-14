export interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    role: 'ADMIN' | 'USER' | 'MANAGER';
    telegram_id: string | null;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
} 