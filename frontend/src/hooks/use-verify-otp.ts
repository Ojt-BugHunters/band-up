import { fetchWrapper, parseBoolean, throwIfError } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import z from 'zod';
import { buildParams } from '@/lib/api';
import { toast } from 'sonner';

export const otpSchema = z.object({
    otp: z
        .string()
        .length(6, { message: 'Enter the 6-digit otp code' })
        .regex(/^\d{6}$/, { message: 'OTP must be 6 digits' }),
});

type VerifyOtpVars = { email: string; otp: string };

export const useVerifyOtp = () => {
    const mutation = useMutation({
        mutationFn: async ({ email, otp }: VerifyOtpVars) => {
            const paramData = buildParams({ email, inputOtp: otp }).toString();
            const response = await fetchWrapper(
                `/auth/account/verify?${paramData}&`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );
            await throwIfError(response);
            return await parseBoolean(response);
        },
        onSuccess: (ok) => {
            if (ok) {
                toast.success('OTP verify successfully');
            } else {
                toast.error('Invalid OTP. Try again');
            }
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    return mutation;
};
