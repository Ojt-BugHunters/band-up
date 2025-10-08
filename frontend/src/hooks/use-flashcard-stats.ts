import { deserialize, fetchWrapper } from '@/lib/api';
import { FlashCardData } from '@/lib/api/dto/flashcard';
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
