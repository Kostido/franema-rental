'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export default function Navbar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Закрываем меню при изменении пути
    useEffect(() => {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
    }, [pathname]);

    // Закрываем меню при клике вне его
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('#user-menu') && !target.closest('#user-menu-button')) {
                setIsUserMenuOpen(false);
            }
            if (!target.closest('#mobile-menu') && !target.closest('#mobile-menu-button')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const navLinks = [
        { href: '/', label: 'Главная' },
        { href: '/equipment', label: 'Оборудование' },
        { href: '/bookings', label: 'Мои бронирования' },
    ];

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                                Franema Rental
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === link.href
                                            ? 'border-blue-500 text-gray-900 dark:text-white'
                                            : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {user ? (
                            <div className="ml-3 relative">
                                <div>
                                    <button
                                        id="user-menu-button"
                                        type="button"
                                        className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    >
                                        <span className="sr-only">Открыть меню пользователя</span>
                                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                            {user.email?.charAt(0).toUpperCase() || <FaUser />}
                                        </div>
                                    </button>
                                </div>

                                {isUserMenuOpen && (
                                    <div
                                        id="user-menu"
                                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                                    >
                                        <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                                            <div className="font-medium truncate">{user.email}</div>
                                        </div>
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                        >
                                            <FaUser className="mr-2" />
                                            Профиль
                                        </Link>
                                        <button
                                            onClick={() => signOut()}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                        >
                                            <FaSignOutAlt className="mr-2" />
                                            Выйти
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <Link
                                    href="/auth/login"
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <FaSignInAlt className="mr-1.5" />
                                    Войти
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <FaUserPlus className="mr-1.5" />
                                    Регистрация
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            id="mobile-menu-button"
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="sr-only">Открыть главное меню</span>
                            <svg
                                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <svg
                                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div id="mobile-menu" className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
                <div className="pt-2 pb-3 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === link.href
                                    ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
                <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                    {user ? (
                        <>
                            <div className="flex items-center px-4">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                        {user.email?.charAt(0).toUpperCase() || <FaUser />}
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <Link
                                    href="/profile"
                                    className="block px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                >
                                    <FaUser className="mr-2" />
                                    Профиль
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                >
                                    <FaSignOutAlt className="mr-2" />
                                    Выйти
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="mt-3 space-y-1 px-4">
                            <Link
                                href="/auth/login"
                                className="block px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            >
                                <FaSignInAlt className="mr-2" />
                                Войти
                            </Link>
                            <Link
                                href="/auth/register"
                                className="block px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            >
                                <FaUserPlus className="mr-2" />
                                Регистрация
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
} 