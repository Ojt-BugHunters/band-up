'use client';

import { fetchWrapper, throwIfError } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export const schema = z.object({
    name: z.string().min(1, { message: 'Name must not be empty' }),
    gender: z.enum(['Male', 'Female']),
    birthday: z.date({
        message: 'Birthday must be a valid date',
    }),
    address: z.string().min(1, { message: 'Address must not be empty' }),
    phone: z.string().min(1, { message: 'Phone must not be empty' }),
});

export type ProfileFormValues = z.infer<typeof schema>;

export const useProfile = () => {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof schema>) => {
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
        resolver: zodResolver(schema),
        defaultValues,
    });

    return {
        form,
        mutation,
    };
};
