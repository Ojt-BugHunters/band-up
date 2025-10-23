import { fetchWrapper, throwIfError } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { TagSchema } from './use-tag';

export const blogBaseSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z
        .string()
        .min(1, 'Content is required')
        .max(100_000, 'Content is too long'),
    topics: TagSchema.shape.topics,
});

export type CreateBlogFormValues = z.infer<typeof blogBaseSchema>;

export function useCreateBlog() {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof blogBaseSchema>) => {
            const response = await fetchWrapper('/blog/create', {
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
        onSuccess: () => {
            toast.success('Blog created successfully');
            router.push('/blog');
        },
    });

    const form = useForm<CreateBlogFormValues>({
        resolver: zodResolver(blogBaseSchema),
        defaultValues: {
            title: '',
            description: '',
            topics: [],
        },
    });

    return {
        form,
        mutation,
    };
}
