'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { LoginButton } from '@telegram-auth/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function TelegramAuthButton() {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    // Если статус загрузки
    if (status === 'loading') {
        return (
            <Button disabled variant="outline" size="sm" className="gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Загрузка...
            </Button>
        );
    }

    // Если пользователь аутентифицирован
    if (status === 'authenticated' && session.user) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Avatar className="h-6 w-6">
                            <div className="h-full w-full bg-gray-200 rounded-full flex items-center justify-center">
                                {session.user.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || 'Пользователь'}
                                        className="h-full w-full object-cover rounded-full"
                                    />
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4 text-gray-500"
                                    >
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                )}
                            </div>
                        </Avatar>
                        <span className="hidden md:inline">{session.user.name}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                        Профиль
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/bookings'}>
                        Мои бронирования
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => {
                            setIsLoading(true);
                            signOut({ callbackUrl: '/' });
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Выход...' : 'Выйти'}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // Если пользователь не аутентифицирован
    return (
        <LoginButton
            botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || ''}
            onAuthCallback={(data) => {
                setIsLoading(true);
                signIn('telegram-login', { callbackUrl: '/' }, data as any);
            }}
            buttonSize="large"
            cornerRadius={8}
            showUserPhoto={true}
            className="telegram-login-button"
        />
    );
} 