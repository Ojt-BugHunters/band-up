import z from 'zod';
import { passwordSchema } from './use-register';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { fetchWrapper, throwIfError } from '@/lib/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

type MutateVars = {
    email: string;
    password: string;
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
