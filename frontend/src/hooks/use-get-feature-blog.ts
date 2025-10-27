'use client';

import { deserialize, fetchWrapper } from '@/lib/api';
import { BlogPost } from '@/lib/api/dto/blog';
import { useQuery } from '@tanstack/react-query';

export const useGetFeaturedBlog = () => {
    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper('/blog/featured');
            return await deserialize<BlogPost[]>(response);
        },
        queryKey: ['featured-blog'],
    });
};
