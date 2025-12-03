'use client';

import { Suspense } from 'react';
import { ResetPasswordForm } from './reset-password-form';

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <ResetPasswordForm />
                </div>
            </div>
        </Suspense>
    );
}
