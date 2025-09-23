'use client';

import { fetchWrapper, throwIfError } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export const passwordSchema = z
    .string()
    .nonempty({ message: 'Password must not be empty' })
    .min(6, { message: 'Password must be at least 6 characters' })
    .regex(/[A-Z]/, {
        message: 'Password must contain at least one uppercase letter',
    })
    .regex(/[a-z]/, {
        message: 'Password must contain at least one lowercase letter',
    })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, {
        message: 'Password must contain at least one special character',
    });

export const schema = z
    .object({
        email: z.string().email({ message: 'Invalid email address' }),
        password: passwordSchema,
        confirmPassword: z
            .string()
            .nonempty({ message: 'Password must not be empty' })
            .min(6, { message: 'Password must be at least 6 characters' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match',
    });

export const useRegisterForm = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

        const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof schema>) => {
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
        onSuccess: (data) => {
            queryClient.setQueryData(['user'], data);
            localStorage.setItem('user', JSON.stringify(data));
            console.log('saved user', queryClient.getQueryData(['user']));
            toast.success('Register Successfully');
            router.push('/profile');
        },
    });

    return {
        form,
        mutation,
    };
};
