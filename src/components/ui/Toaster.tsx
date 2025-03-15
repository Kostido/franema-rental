'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
    return (
        <HotToaster
            position="bottom-right"
            toastOptions={{
                duration: 5000,
                style: {
                    background: '#fff',
                    color: '#333',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
                success: {
                    style: {
                        borderLeft: '4px solid #10b981',
                    },
                },
                error: {
                    style: {
                        borderLeft: '4px solid #ef4444',
                    },
                },
            }}
        />
    );
} 