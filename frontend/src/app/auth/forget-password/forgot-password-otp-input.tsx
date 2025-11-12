'use client';
import { useForgetPassword } from '@/lib/service/account';
import { Shield } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { OtpVerificationForm } from './otp-input';

export function ForgotPasswordForm() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') ?? '';
    const resend = useForgetPassword();

    const handleResend = () => {
        if (!email) {
            toast.error(
                'Missing email. Please go back and enter your email again.',
            );
            return;
        }
        resend.mutate(email);
    };

    return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <div className="bg-primary/10 rounded-full p-4">
                            <Shield className="text-primary h-8 w-8" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance">
                            Verify your identity
                        </h1>
                        <p className="text-foreground/80 leading-relaxed text-pretty">
                            We have sent a 6-digit verification code to your
                            email. Enter it below to continue.
                        </p>
                    </div>
                </div>

                <OtpVerificationForm />

                <div className="space-y-4 text-center">
                    <p className="text-foreground/80 text-sm">
                        Didn&apos;t receive the code?{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={!email || resend.isPending}
                            className="text-primary hover:text-primary/80 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            aria-disabled={!email || resend.isPending}
                        >
                            {resend.isPending ? 'Sending…' : 'Resend code'}
                        </button>
                    </p>
                    <p className="text-foreground/70 text-xs">
                        This code will expire in 10 minutes
                    </p>
                </div>
            </div>
        </div>
    );
}
