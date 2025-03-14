'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { TELEGRAM_CONFIG } from '@/lib/telegram/config';
import QRCode from 'qrcode.react';

export function TelegramVerification() {
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const botLink = `https://t.me/${TELEGRAM_CONFIG.BOT_USERNAME}`;

    const handleVerification = async () => {
        try {
            setIsVerifying(true);
            setError(null);

            // Проверяем код верификации
            const { data: verification, error: verificationError } = await supabase
                .from('telegram_verifications')
                .select('*')
                .eq('verification_code', verificationCode)
                .eq('status', 'pending')
                .single();

            if (verificationError || !verification) {
                setError('Неверный код верификации или код истек');
                return;
            }

            // Обновляем статус верификации
            const { error: updateError } = await supabase
                .from('telegram_verifications')
                .update({ status: 'verified' })
                .eq('id', verification.id);

            if (updateError) {
                setError('Ошибка при обновлении статуса верификации');
                return;
            }

            // Обновляем профиль пользователя
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    telegram_id: verification.telegram_id,
                    is_verified: true,
                })
                .eq('id', verification.user_id);

            if (profileError) {
                setError('Ошибка при обновлении профиля');
                return;
            }

            // Успешная верификация
            window.location.reload();
        } catch (err) {
            setError('Произошла ошибка при верификации');
            console.error('Verification error:', err);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-6 p-6 bg-card rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-foreground">Верификация через Telegram</h2>

            <div className="flex flex-col items-center space-y-4">
                <QRCode value={botLink} size={200} />

                <p className="text-sm text-muted-foreground text-center">
                    Отсканируйте QR-код или{' '}
                    <a
                        href={botLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                    >
                        перейдите по ссылке
                    </a>
                    , чтобы начать верификацию
                </p>
            </div>

            <div className="flex flex-col space-y-4 w-full max-w-sm">
                <Input
                    type="text"
                    placeholder="Введите код верификации"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="text-center uppercase"
                    maxLength={6}
                />

                <Button
                    onClick={handleVerification}
                    disabled={isVerifying || !verificationCode}
                    className="w-full"
                >
                    {isVerifying ? 'Проверка...' : 'Подтвердить'}
                </Button>

                {error && (
                    <p className="text-sm text-destructive text-center">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
} 