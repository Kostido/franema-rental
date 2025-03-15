'use client';

import * as React from 'react';

export function Avatar({
    className = '',
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
        >
            {children}
        </div>
    );
}

export function AvatarImage({
    src,
    alt,
    className = '',
}: {
    src: string;
    alt: string;
    className?: string;
}) {
    return (
        <img
            src={src}
            alt={alt}
            className={`aspect-square h-full w-full object-cover ${className}`}
        />
    );
}

export function AvatarFallback({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-sm font-medium uppercase text-gray-800 ${className}`}
        >
            {typeof children === 'string'
                ? children.substring(0, 2)
                : children}
        </div>
    );
} 