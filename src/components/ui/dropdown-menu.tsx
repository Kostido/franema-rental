'use client';

import * as React from 'react';
import { createContext, useContext } from 'react';

// Контекст для DropdownMenu
const DropdownMenuContext = createContext<{
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    open: false,
    setOpen: () => { },
});

export function DropdownMenu({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);

    return (
        <DropdownMenuContext.Provider value={{ open, setOpen }}>
            <div className="relative">{children}</div>
        </DropdownMenuContext.Provider>
    );
}

export function DropdownMenuTrigger({
    asChild,
    children,
}: {
    asChild?: boolean;
    children: React.ReactNode;
}) {
    const { open, setOpen } = useContext(DropdownMenuContext);

    return (
        <div
            onClick={() => setOpen(!open)}
            className="cursor-pointer"
        >
            {children}
        </div>
    );
}

export function DropdownMenuContent({
    align = 'center',
    children,
    className = '',
}: {
    align?: 'start' | 'center' | 'end';
    children: React.ReactNode;
    className?: string;
}) {
    const { open } = useContext(DropdownMenuContext);

    if (!open) return null;

    const alignClasses = {
        start: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-0',
    };

    return (
        <div
            className={`absolute z-50 mt-2 min-w-[8rem] rounded-md border border-gray-200 bg-white p-1 shadow-lg ${alignClasses[align]} ${className}`}
        >
            {children}
        </div>
    );
}

export function DropdownMenuItem({
    onClick,
    disabled = false,
    children,
}: {
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    const { setOpen } = useContext(DropdownMenuContext);

    const handleClick = () => {
        if (disabled) return;
        onClick?.();
        setOpen(false);
    };

    return (
        <div
            onClick={handleClick}
            className={`flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none ${disabled
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-gray-100 focus:bg-gray-100'
                }`}
        >
            {children}
        </div>
    );
}

export function DropdownMenuLabel({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="px-2 py-1.5 text-sm font-semibold">{children}</div>
    );
}

export function DropdownMenuSeparator() {
    return <div className="my-1 h-px bg-gray-200" />;
} 