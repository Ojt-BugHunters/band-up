import { buildParams, deserialize, fetchWrapper, Pagination } from '@/lib/api';
import { Deck, FlashCardData, PaginationInfo } from './type';
import { useQuery } from '@tanstack/react-query';

export const useGetFlashcardStats = () => {
    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper(`/quizlet/stats`);
            return await deserialize<FlashCardData>(response);
        },
        queryKey: ['quizlet', 'stats'],
    });
};

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
