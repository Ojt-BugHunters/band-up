'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import {
    mockFlashcards,
    flashcardItemsForSet1,
} from '../../../../../constants/sample-data';
import FlashcardPlayer from '@/components/flashcard-player';

export default function FlashcardPlayerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = React.use(params);
    const flashcard = mockFlashcards.find((card) => card.id === id);
    if (!flashcard) return notFound();

    const itemsByDeck: Record<string, typeof flashcardItemsForSet1> = {
        '1': flashcardItemsForSet1,
    };
    const items = itemsByDeck[flashcard.id] ?? [];

    return (
        <div className="bg-background flex min-h-screen items-center justify-center p-8">
            <div className="w-full max-w-5xl">
                <FlashcardPlayer cards={items} variant="large" />
            </div>
        </div>
    );
}
