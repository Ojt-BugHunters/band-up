'use client';

import { useQuery } from '@tanstack/react-query';
import { buildParams, deserialize, fetchWrapper, Pagination } from '@/lib/api';
import { Deck } from '@/lib/api/dto/flashcard';
interface PaginationInfo {
    pageNo?: number;
    pageSize?: number;
    sortBy?: string;
    ascending?: boolean;
    queryBy?: string;
    visibility?: '' | 'public' | 'private';
    isLearned?: boolean;
}

export const useGetDeck = (paginationInfo: PaginationInfo) => {
    const params = buildParams(paginationInfo as Record<string, unknown>);

    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper(
                `/quizlet/deck?${params.toString()}`,
            );
            return await deserialize<Pagination<Deck>>(response);
        },
        placeholderData: (prev) => prev,
        staleTime: 10_000,
        refetchOnWindowFocus: false,
        queryKey: ['flash-card', paginationInfo],
    });
};
