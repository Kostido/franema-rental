'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
    className?: string;
    variant?: 'default' | 'link' | 'icon';
    children?: React.ReactNode;
}

export default function LogoutButton({
    className = '',
    variant = 'default',
    children,
}: LogoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        setIsLoading(true);

        try {
            await supabase.auth.signOut();
            router.push('/auth/login');
            router.refresh();
        } catch (error) {
            console.error('Ошибка при выходе из системы:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === 'link') {
        return (
            <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`text-sm font-medium text-gray-700 hover:text-gray-900 ${className}`}
            >
                {isLoading ? 'Выход...' : children || 'Выйти'}
            </button>
        );
    }

    if (variant === 'icon') {
        return (
            <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`text-gray-500 hover:text-gray-700 ${className}`}
                aria-label="Выйти"
            >
                {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-gray-500 rounded-full" />
                ) : (
                    children || (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    )
                )}
            </button>
        );
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
        >
            {isLoading ? 'Выход...' : children || 'Выйти'}
        </button>
    );
} 