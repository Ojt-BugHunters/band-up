'use client';
import React from 'react';
import { mockDeckItems } from '../../../../../constants/sample-data';
import FlashcardPlayer from '@/components/flashcard-player';

// in the page --> fetch api /api/quizlet/deck/{deckId}/card --> get data like this
// just need {deckId in param}
// [
//     {
//         id: 'e40cfd2a-aaa5-440a-b1f8-3727627f5b68',
//         front: 'ECS',
//         back: 'Elastic Container Service',
//     },
// ]; --> mockDeckItems
export default function FlashcardPlayerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = React.use(params);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8 dark:bg-[#0a092d]">
            <div className="w-full max-w-5xl">
                <FlashcardPlayer cards={mockDeckItems} />
            </div>
        </div>
    );
}
