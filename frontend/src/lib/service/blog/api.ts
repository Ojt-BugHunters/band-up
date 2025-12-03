import {
    buildParams,
    deserialize,
    fetchWrapper,
    Pagination,
    throwIfError,
} from '@/lib/service';
import {
    blogBaseSchema,
    BlogPost,
    CreateBlogFormValues,
    PaginationInfo,
} from './type';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

// get list of blogs
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
        staleTime: 10 * 60 * 1000, // 10 mins
        queryKey: ['blog', paginationInfo],
        refetchOnWindowFocus: false,
    });
};

// get feature blogs
export const useGetFeaturedBlog = () => {
    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper('/blog/featured');
            return await deserialize<BlogPost[]>(response);
        },
        queryKey: ['featured-blog'],
        staleTime: 10 * 60 * 1000, // 10 mins
    });
};

// increase the number of reader
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

// get content of detail blog
export const useGetBlogDetail = (id: string) => {
    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper(`/blog/${id}`);
            return await deserialize<BlogPost>(response);
        },
        queryKey: ['blog-content'],
        staleTime: 30 * 60 * 1000, // 30 mins
    });
};

// update a blog
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
}

// create new blog
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
