import {
    buildParams,
    deserialize,
    fetchWrapper,
    Pagination,
    throwIfError,
} from '@/lib/api';
import { BlogPost, PaginationInfo } from './type';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGetBlogs = (paginationInfo: PaginationInfo) => {
    const params = buildParams(paginationInfo as Record<string, unknown>);
    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper(
                `/blog/search?${params.toString()}`,
            );
            return await deserialize<Pagination<BlogPost>>(response);
        },
        placeholderData: (prev) => prev,
        staleTime: 10_000,
        queryKey: ['blog', paginationInfo],
        refetchOnWindowFocus: false,
    });
};

export const useGetFeaturedBlog = () => {
    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper('/blog/featured');
            return await deserialize<BlogPost[]>(response);
        },
        queryKey: ['featured-blog'],
    });
};

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
