'use client';

import { fetchWrapper, throwIfError } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export const schema = z
    .object({
        name: z.string().min(1, {message: 'Name must not be empty'}),
        gender: z.enum(["Male", "Female"]),
        birthday: z.string(),
        address: z.string().min(1, {message: 'Address must not be empty'}),
        phone: z.string().min(1, {message: 'Phone must not be empty'}),
    })

export const useProfile = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

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
            toast.success('Submit Successfully');
            router.push('/');
        },
    });

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            gender: undefined,
            birthday: '',
            address: '',
            phone: '',
        },
    });

    return {
        form,
        mutation,
    };
};