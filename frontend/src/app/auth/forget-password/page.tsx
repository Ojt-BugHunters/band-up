'use client';
import { Suspense } from 'react';
import { ForgotPasswordForm } from './forgot-password-otp-input';

export default function ForgetPasswordPage() {
    return (
        <Suspense>
            <ForgotPasswordForm />
        </Suspense>
    );
}
