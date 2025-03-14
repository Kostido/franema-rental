'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { UserRole } from '@/types';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    requireVerification?: boolean;
    fallbackUrl?: string;
}

export default function AuthGuard({
    children,
    allowedRoles,
    requireVerification = false,
    fallbackUrl = '/auth/login',
}: AuthGuardProps) {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Если данные загружаются, ничего не делаем
        if (isLoading) return;

        // Если пользователь не авторизован, перенаправляем на страницу входа
        if (!user) {
            router.push(`${fallbackUrl}?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

        // Если требуется верификация и пользователь не верифицирован
        if (requireVerification && !user.isVerified) {
            router.push('/auth/verify-telegram');
            return;
        }

        // Если указаны разрешенные роли и роль пользователя не входит в список
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            router.push('/');
            return;
        }
    }, [user, isLoading, router, pathname, fallbackUrl, allowedRoles, requireVerification]);

    // Показываем индикатор загрузки, пока проверяем аутентификацию
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // Если пользователь не авторизован или не имеет нужных прав, не показываем содержимое
    if (!user || (allowedRoles && !allowedRoles.includes(user.role)) || (requireVerification && !user.isVerified)) {
        return null;
    }

    // Если все проверки пройдены, показываем содержимое
    return <>{children}</>;
}
