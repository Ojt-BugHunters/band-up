import { fetchWrapper, throwIfError } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export const TestCreateSchema = z.object({
    skillName: z.string().min(1, 'Skill name is required'),
    title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title is too long'),
    durationSeconds: z.number(),
});

export const useCreateTest = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof TestCreateSchema>) => {
            const response = await fetchWrapper('/tests', {
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
            queryClient.setQueryData(['testId'], data.id);
            console.log(data);
            localStorage.setItem('testId', JSON.stringify(data.id));
            toast.success('Create new test successfully');
            router.push(
                `/test/create?step=section&type=${data.skillName}&testId=${data.id}`,
            );
        },
    });

    const form = useForm<z.infer<typeof TestCreateSchema>>({
        resolver: zodResolver(TestCreateSchema),
        defaultValues: {},
    });

    return {
        form,
        mutation,
    };
};
