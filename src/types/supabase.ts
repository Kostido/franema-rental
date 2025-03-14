export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string;
                    role: 'ADMIN' | 'USER' | 'MANAGER';
                    telegram_id: string | null;
                    is_verified: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name: string;
                    role?: 'ADMIN' | 'USER' | 'MANAGER';
                    telegram_id?: string | null;
                    is_verified?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string;
                    role?: 'ADMIN' | 'USER' | 'MANAGER';
                    telegram_id?: string | null;
                    is_verified?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            equipment: {
                Row: {
                    id: string;
                    name: string;
                    description: string;
                    category: 'CAMERA' | 'LENS' | 'LIGHTING' | 'AUDIO' | 'ACCESSORY' | 'OTHER';
                    serial_number: string;
                    is_available: boolean;
                    image_url: string | null;
                    specifications: Json | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description: string;
                    category: 'CAMERA' | 'LENS' | 'LIGHTING' | 'AUDIO' | 'ACCESSORY' | 'OTHER';
                    serial_number: string;
                    is_available?: boolean;
                    image_url?: string | null;
                    specifications?: Json | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string;
                    category?: 'CAMERA' | 'LENS' | 'LIGHTING' | 'AUDIO' | 'ACCESSORY' | 'OTHER';
                    serial_number?: string;
                    is_available?: boolean;
                    image_url?: string | null;
                    specifications?: Json | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            bookings: {
                Row: {
                    id: string;
                    user_id: string;
                    equipment_id: string;
                    start_date: string;
                    end_date: string;
                    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    equipment_id: string;
                    start_date: string;
                    end_date: string;
                    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    equipment_id?: string;
                    start_date?: string;
                    end_date?: string;
                    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            telegram_verifications: {
                Row: {
                    id: string;
                    user_id: string;
                    verification_code: string;
                    is_verified: boolean;
                    telegram_id: string | null;
                    expires_at: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    verification_code: string;
                    is_verified?: boolean;
                    telegram_id?: string | null;
                    expires_at: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    verification_code?: string;
                    is_verified?: boolean;
                    telegram_id?: string | null;
                    expires_at?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            check_equipment_availability: {
                Args: {
                    equipment_id: string;
                    start_date: string;
                    end_date: string;
                    exclude_booking_id?: string;
                };
                Returns: boolean;
            };
        };
        Enums: {
            user_role: 'ADMIN' | 'USER' | 'MANAGER';
            equipment_category: 'CAMERA' | 'LENS' | 'LIGHTING' | 'AUDIO' | 'ACCESSORY' | 'OTHER';
            booking_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
        };
    };
}

// Типы для удобного использования в приложении
export type User = Database['public']['Tables']['users']['Row'];
export type NewUser = Database['public']['Tables']['users']['Insert'];
export type UpdateUser = Database['public']['Tables']['users']['Update'];

export type Equipment = Database['public']['Tables']['equipment']['Row'];
export type NewEquipment = Database['public']['Tables']['equipment']['Insert'];
export type UpdateEquipment = Database['public']['Tables']['equipment']['Update'];

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type NewBooking = Database['public']['Tables']['bookings']['Insert'];
export type UpdateBooking = Database['public']['Tables']['bookings']['Update'];

export type TelegramVerification = Database['public']['Tables']['telegram_verifications']['Row'];
export type NewTelegramVerification = Database['public']['Tables']['telegram_verifications']['Insert'];
export type UpdateTelegramVerification = Database['public']['Tables']['telegram_verifications']['Update'];

// Типы перечислений
export type UserRole = Database['public']['Enums']['user_role'];
export type EquipmentCategory = Database['public']['Enums']['equipment_category'];
export type BookingStatus = Database['public']['Enums']['booking_status']; 