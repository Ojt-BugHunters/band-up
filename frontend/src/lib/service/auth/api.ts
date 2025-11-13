'use client';
import { fetchWrapper, parseBoolean, throwIfError } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildParams } from '@/lib/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
    loginSchema,
    MutateVars,
    OtpFormValues,
    otpSchema,
    ProfileFormValues,
    profileRegisterSchema,
    registerSchema,
    ResetPasswordFormValues,
    resetPasswordSchema,
    VerifyOtpVars,
} from './type';
import z from 'zod';

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

export const useForgetPassword = () => {
    const router = useRouter();
    const mutation = useMutation({
        mutationFn: async (email: string) => {
            const encodeEmail = new URLSearchParams({ email }).toString();
            const response = await fetchWrapper(
                `/auth/account/forget?${encodeEmail}`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );
            await throwIfError(response);
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (_data, email) => {
            toast.success('We have sent a verification code to your email.');
            const qs = buildParams({ email }).toString();
            router.push(`/auth/forget-password?${qs}&state=forget`);
        },
    });
    return mutation;
};

export const useLogin = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof loginSchema>) => {
            const response = await fetchWrapper('/auth/login', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['user'], data);
            localStorage.setItem('user', JSON.stringify(data));
            toast.success('Login Successfully');
            if (data.role === 'Member') {
                router.push('/');
            } else {
                router.push('/admin');
            }
        },
    });

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    return {
        form,
        mutation,
    };
};

export const useRegisterForm = () => {
    const router = useRouter();
    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof registerSchema>) => {
            const response = await fetchWrapper('/auth/register', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (ok, data) => {
            if (ok) {
                toast.success('Send OTP to email success');
                const qs = buildParams({
                    email: data.email,
                }).toString();
                router.push(`/auth/forget-password?${qs}&state=register`);
            } else {
                toast.error('Error when send OTP to email');
            }
        },
    });

    return {
        form,
        mutation,
    };
};

export const useResetPassword = (inputOtp: string) => {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (values: MutateVars) => {
            const response = await fetchWrapper(
                `/auth/account/reset-password?inputOtp=${inputOtp}`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: values.email,
                        password: values.password,
                    }),
                },
            );
            await throwIfError(response);
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: () => {
            toast.success('Rest password successfully.Login again!');
            router.push('/auth/login');
        },
    });
    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {},
    });

    return { form, mutation };
};

export const useProfile = () => {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof profileRegisterSchema>) => {
            const formatDateForBackend = (date: Date) => {
                const day = String(date.getUTCDate()).padStart(2, '0');
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const year = date.getUTCFullYear();
                return `${day}-${month}-${year}`;
            };
            const payload = {
                ...values,
                birthday:
                    values.birthday instanceof Date
                        ? formatDateForBackend(values.birthday)
                        : values.birthday,
            };
            const response = await fetchWrapper('/profile/update', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: () => {
            toast.success('Submit Successfully. Please login again');
            router.push('/auth/login');
        },
    });

    const defaultValues = {
        name: '',
        gender: undefined,
        birthday: undefined,
        address: '',
        phone: '',
    } satisfies Partial<ProfileFormValues>;

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileRegisterSchema),
        defaultValues,
    });

    return {
        form,
        mutation,
    };
};
