'use client';

import { useState, useEffect } from 'react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClientSupabaseClient();

    useEffect(() => {
        const getUser = async () => {
            setLoading(true);

            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error getting user:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session?.user) {
                    setUser(session.user);
                } else {
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return {
        user,
        loading,
        signOut,
    };
} 