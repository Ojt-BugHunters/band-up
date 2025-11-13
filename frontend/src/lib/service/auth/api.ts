'use client';
import { fetchWrapper, parseBoolean, throwIfError } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { buildParams } from '@/lib/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { OtpFormValues, otpSchema, VerifyOtpVars } from './type';

export const useVerifyOtp = () => {
    const router = useRouter();
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
        onSuccess: (ok, variables) => {
            if (ok) {
                toast.success('OTP verify successfully');
                const qs = buildParams({
                    email: variables.email,
                    otp: variables.otp,
                }).toString();
                router.push(`/auth/reset?${qs}`);
            } else {
                toast.error('Invalid OTP. Try again');
            }
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const form = useForm<OtpFormValues>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: '' },
        mode: 'onSubmit',
    });

    return { form, mutation };
};

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
