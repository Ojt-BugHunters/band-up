'use client';
import { ProfileForm } from './profile-form';

export default function RegisterPage() {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <ProfileForm />
            </div>
        </div>
    );
}
