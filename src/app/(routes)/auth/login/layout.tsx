import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Вход | Franema Rental',
    description: 'Войдите в систему бронирования видеотехники через Telegram',
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
} 