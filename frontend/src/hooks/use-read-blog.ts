import { fetchWrapper, throwIfError } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useReadBlog = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (blogId: string) => {
            const response = await fetchWrapper(`/blog/${blogId}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            await throwIfError(response);
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['blog', 'blog-content'],
            });
        },
    });
    return mutation;
};
