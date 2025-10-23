'use client';

import { deserialize, fetchWrapper } from '@/lib/api';
import { Tag } from '@/lib/api/dto/category';
import { useQuery } from '@tanstack/react-query';

export const useGetTags = () => {
    return useQuery({
        queryKey: ['tags'],
        queryFn: async () => {
            const response = await fetchWrapper('/blog/tags');
            return await deserialize<Tag[]>(response);
        },
    });
};
