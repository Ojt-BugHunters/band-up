'use client';

import { useQuery } from '@tanstack/react-query';
import { buildParams, deserialize, fetchWrapper, Pagination } from '@/lib/api';
import { Deck } from '@/lib/api/dto/flashcard';

// Below is the information backend need to pagination and it will return a pageable object
interface PaginationInfo {
    pageNo?: number;
    pageSize?: number;
    sortBy?: string;
    ascending?: boolean;
}

// Build params as I said in /lib/api/index.ts
// we use tanstack queryFn in the case that we get data from backend and do not update, new or delete it
// instead of fetch to /quizlet/deck?pageNo=0&pageSize=100 like the old version. We just fetch enough data to render in that page (8 decks)
// In the case user go to other page, we call api and fetch another 8 decks
// it will faster than fetch 100 decks.
export const useGetDeck = (paginationInfo: PaginationInfo) => {
    const params = buildParams(paginationInfo as Record<string, unknown>);

    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper(
                `/quizlet/deck?${params.toString()}`,
            );
            return await deserialize<Pagination<Deck>>(response);
        },
        queryKey: ['flash-card', paginationInfo],
    });
};
