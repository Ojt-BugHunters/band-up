'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchWrapper, throwIfError } from '@/lib/api';
import {
    DeckApiResponse,
    Flashcard,
    mapDeckToFlashcard,
} from '@/lib/api/dto/flashcard';

export const useFlashcardDecks = () =>
    useQuery<Flashcard[]>({
        queryKey: ['flashcard-decks'],
        queryFn: async () => {
            const response = await fetchWrapper('/quizlet/deck?pageNo=0&pageSize=100');
            await throwIfError(response);
            const decks: DeckApiResponse[] = await response.json();
            return decks.map(mapDeckToFlashcard);
        },
    });
