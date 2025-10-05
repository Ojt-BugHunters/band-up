'use client';
import React from 'react';
import { notFound } from 'next/navigation';
import {
    mockFlashcards,
    mockDeckItems,
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

    const itemsByDeck: Record<string, typeof mockDeckItems> = {
        '1': mockDeckItems,
    };

    const items = itemsByDeck[flashcard.id] ?? [];

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8 dark:bg-[#0a092d]">
            <div className="w-full max-w-5xl">
                <FlashcardPlayer cards={items} />
            </div>
        </div>
    );
}
