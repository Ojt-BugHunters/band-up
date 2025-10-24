'use client';

import { buildParams, deserialize, fetchWrapper, Pagination } from '@/lib/api';
import { BlogPost } from '@/lib/api/dto/blog';
import { useQuery } from '@tanstack/react-query';

interface PaginationInfo {
    pageNo?: number;
    pageSize?: number;
    queryBy?: string;
    ascending?: boolean;
    tagId?: string;
}

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
