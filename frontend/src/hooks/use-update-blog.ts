import { fetchWrapper, throwIfError } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
    type CreateBlogFormValues,
    blogBaseSchema,
} from './use-create-blog';

export function useUpdateBlog(blogId: string | null | undefined) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (values: CreateBlogFormValues) => {
            if (!blogId) {
                throw new Error('Missing blog id');
            }

            const response = await fetchWrapper(`/blog/${blogId}/update`, {
                    method: 'PUT',
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
            toast.success('Blog updated successfully');
            queryClient.invalidateQueries({ queryKey: ['blog', blogId] });
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
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

    return { form, mutation };
};
