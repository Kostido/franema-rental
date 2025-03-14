/**
 * Типы пользователей системы
 */
export interface User {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    telegramId?: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
    MANAGER = 'MANAGER',
}

/**
 * Типы оборудования
 */
export interface Equipment {
    id: string;
    name: string;
    description: string;
    category: EquipmentCategory;
    serialNumber: string;
    isAvailable: boolean;
    imageUrl?: string;
    specifications?: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
}

export enum EquipmentCategory {
    CAMERA = 'CAMERA',
    LENS = 'LENS',
    LIGHTING = 'LIGHTING',
    AUDIO = 'AUDIO',
    ACCESSORY = 'ACCESSORY',
    OTHER = 'OTHER',
}

/**
 * Типы бронирования
 */
export interface Booking {
    id: string;
    userId: string;
    equipmentId: string;
    startDate: Date;
    endDate: Date;
    status: BookingStatus;
    notes?: string;
    equipment?: Equipment;
    user?: User;
    createdAt: Date;
    updatedAt: Date;
}

export enum BookingStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
}

/**
 * Типы для телеграм интеграции
 */
export interface TelegramVerification {
    id: string;
    userId: string;
    verificationCode: string;
    isVerified: boolean;
    telegramId?: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Типы для API запросов
 */
export type ApiResponse<T> = {
    data?: T;
    error?: string;
    status: 'success' | 'error';
}; 