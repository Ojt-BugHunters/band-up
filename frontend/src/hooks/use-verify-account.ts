import { buildParams, fetchWrapper, throwIfError } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { VerifyOtpVars } from './use-verify-otp';

export const useVerifyUser = () => {
    const router = useRouter();
    const mutation = useMutation({
        mutationFn: async ({ email, otp }: VerifyOtpVars) => {
            const paramData = buildParams({ email, inputOtp: otp }).toString();
            const response = await fetchWrapper(`/auth/verify?${paramData}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
            });
            await throwIfError(response);
            return response.json();
        },
        onSuccess: () => {
            router.push('/auth/register/profile');
            toast.success('OTP verify successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    return { mutation };
};
