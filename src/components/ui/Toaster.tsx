'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
    return (
        <HotToaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                style: {
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                },
                success: {
                    style: {
                        borderColor: 'var(--success)',
                    },
                },
                error: {
                    style: {
                        borderColor: 'var(--error)',
                    },
                },
            }}
        />
    );
} 