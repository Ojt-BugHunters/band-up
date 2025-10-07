// 'use client';

// import { useQuery } from '@tanstack/react-query';
// import { fetchWrapper, throwIfError } from '@/lib/api';
// import {
//     CardApiResponse,
//     DeckApiResponse,
//     Flashcard,
//     FlashcardItem,
//     mapCardToFlashcardItem,
//     mapDeckToFlashcard,
// } from '@/lib/api/dto/flashcard';

// const buildPasswordBody = (password?: string) =>
//     JSON.stringify(password?.trim() ?? '');

// export const useFlashcardDeck = (
//     deckId?: string,
//     password?: string,
// ) =>
//     useQuery<Flashcard>({
//         queryKey: ['flashcard-deck', deckId, password?.trim() ?? ''],
//         enabled: Boolean(deckId),
//         queryFn: async () => {
//             const response = await fetchWrapper(`/quizlet/deck/${deckId}`, {
//                 method: 'POST',
//                 headers: {
//                     Accept: 'application/json',
//                     'Content-Type': 'application/json',
//                 },
//                 body: buildPasswordBody(password),
//             });

//             await throwIfError(response);
//             const deck: DeckApiResponse = await response.json();
//             return mapDeckToFlashcard(deck);
//         },
//     });

// export const useFlashcardDeckCards = (
//     deckId?: string,
//     password?: string,
// ) =>
//     useQuery<FlashcardItem[]>({
//         queryKey: ['flashcard-deck-cards', deckId, password?.trim() ?? ''],
//         enabled: Boolean(deckId),
//         queryFn: async () => {
//             const response = await fetchWrapper(`/quizlet/deck/${deckId}/card`, {
//                 method: 'POST',
//                 headers: {
//                     Accept: 'application/json',
//                     'Content-Type': 'application/json',
//                 },
//                 body: buildPasswordBody(password),
//             });

//             await throwIfError(response);
//             const cards: CardApiResponse[] = await response.json();
//             return cards.map(mapCardToFlashcardItem);
//         },
//     });
