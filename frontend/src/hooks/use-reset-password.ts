import z from 'zod';
import { passwordSchema } from './use-register';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { fetchWrapper, throwIfError } from '@/lib/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const resetPasswordSchema = z.object({
    email: z.string().min(1, { message: 'Email must not be empty' }),
    password: passwordSchema,
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const useResetPassword = (inputOtp: string) => {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (values: ResetPasswordFormValues) => {
            const response = await fetchWrapper(
                `/auth/account/reset-password?${inputOtp}`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
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
