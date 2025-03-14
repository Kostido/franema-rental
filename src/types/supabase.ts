import { BookingStatus, EquipmentCategory, UserRole } from './index';

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string;
                    role: UserRole;
                    telegram_id: string | null;
                    is_verified: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    full_name: string;
                    role?: UserRole;
                    telegram_id?: string | null;
                    is_verified?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string;
                    role?: UserRole;
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
                    category: EquipmentCategory;
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
                    category: EquipmentCategory;
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
                    category?: EquipmentCategory;
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
                    status: BookingStatus;
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
                    status?: BookingStatus;
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
                    status?: BookingStatus;
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
            [_ in never]: never;
        };
        Enums: {
            equipment_category: EquipmentCategory;
            booking_status: BookingStatus;
            user_role: UserRole;
        };
    };
}; 