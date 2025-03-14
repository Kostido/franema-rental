'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '@/lib/supabase/client';

export default function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClientSupabaseClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            router.push('/auth/verify');
        } catch (error: any) {
            setError(error.message || 'Произошла ошибка при регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Пароль
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}
            <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
            >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
            <div className="text-center text-sm">
                Уже есть аккаунт?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
                    Войти
                </Link>
            </div>
        </form>
    );
} 