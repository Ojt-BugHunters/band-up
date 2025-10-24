'use client';

import { deserialize, fetchWrapper } from '@/lib/api';
import { BlogPost } from '@/lib/api/dto/blog';
import { useQuery } from '@tanstack/react-query';

export const useGetBlogDetail = (id: string) => {
    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper(`/blog/${id}`);
            return await deserialize<BlogPost>(response);
        },
        queryKey: ['blog-content'],
    });
};
