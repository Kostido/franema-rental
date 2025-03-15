'use client';

import * as React from 'react';

type ButtonVariant = 'default' | 'primary' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const variantStyles: Record<ButtonVariant, string> = {
    default: 'bg-gray-900 text-white hover:bg-gray-800',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
    ghost: 'bg-transparent hover:bg-gray-100',
    link: 'bg-transparent underline-offset-4 hover:underline',
};

const sizeStyles: Record<ButtonSize, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3 text-sm',
    lg: 'h-11 rounded-md px-8 text-base',
    icon: 'h-10 w-10',
};

export function Button({
    className = '',
    variant = 'default',
    size = 'default',
    disabled = false,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
}) {
    return (
        <button
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
} 