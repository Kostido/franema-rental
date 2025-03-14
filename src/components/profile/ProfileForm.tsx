'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from '@/types/user';
import { toast } from 'react-hot-toast';

// Схема валидации для формы профиля
const profileSchema = z.object({
    first_name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
    last_name: z.string().min(2, 'Фамилия должна содержать минимум 2 символа'),
    email: z.string().email('Введите корректный email'),
    phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
    initialData: User;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: initialData.first_name || '',
            last_name: initialData.last_name || '',
            email: initialData.email || '',
            phone: initialData.phone || '',
        },
    });

    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при обновлении профиля');
            }

            toast.success('Профиль успешно обновлен');
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            toast.error(error instanceof Error ? error.message : 'Ошибка при обновлении профиля');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="first_name" className="block text-sm font-medium mb-1">
                        Имя
                    </label>
                    <input
                        id="first_name"
                        type="text"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register('first_name')}
                        disabled={isLoading}
                    />
                    {errors.first_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="last_name" className="block text-sm font-medium mb-1">
                        Фамилия
                    </label>
                    <input
                        id="last_name"
                        type="text"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...register('last_name')}
                        disabled={isLoading}
                    />
                    {errors.last_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('email')}
                    disabled={isLoading}
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Телефон
                </label>
                <input
                    id="phone"
                    type="tel"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('phone')}
                    disabled={isLoading}
                    placeholder="+7 (XXX) XXX-XX-XX"
                />
                {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </div>
        </form>
    );
} 