'use client';
import { useQuery } from '@tanstack/react-query';
import { Tag } from '@/lib/api/dto/category';
import { fetchTagsApi } from '@/lib/utils';

export const useGetTags = (keyword = '', enabled = true) => {
    return useQuery<Tag[]>({
        queryKey: ['tags', keyword],
        queryFn: () => fetchTagsApi(keyword),
        enabled,
        staleTime: 5 * 60_000,
        gcTime: 10 * 60_000,
    });
};
