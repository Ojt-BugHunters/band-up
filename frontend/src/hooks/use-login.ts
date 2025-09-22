'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { passwordSchema } from './use-register-form';
import z from 'zod';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { fetchWrapper, throwIfError } from '@/lib/api';
import { toast } from 'sonner';

export const schema = z.object({
    email: z.string().min(1, { message: 'Email must not be empty' }),
    password: passwordSchema,
});

export const useLoginForm = () => {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof schema>) => {
            const response = await fetchWrapper('/auth/login', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });
            await throwIfError(response);
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: () => router.push('/'),
    });

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
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
