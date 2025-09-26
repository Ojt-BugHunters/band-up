// src/app/flashcard/[id]/page.tsx
'use client';

import { notFound } from 'next/navigation';
import { mockFlashcards } from '../../../../constants/sample-data';
import FlashcardPlayer from '@/components/flashcard-player';
import {
    Hero,
    HeroDescription,
    HeroKeyword,
    HeroSummary,
    HeroTitle,
} from '@/components/hero';
import { BookOpenCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function FlashcardDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const flashcard = mockFlashcards.find((card) => card.id === params.id);

    if (!flashcard) return notFound();

    const createdAt = flashcard.created_at
        ? new Date(flashcard.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : 'Unknown date';

    return (
        <div className="flex-1 space-y-6 p-6">
            <Hero>
                <HeroSummary color="green">
                    <BookOpenCheck className="mr-2 h-4 w-4" />
                    Flashcard Detail
                </HeroSummary>
                <HeroTitle>
                    {flashcard.title}
                    <HeroKeyword color="blue">Deck</HeroKeyword>
                </HeroTitle>
                <HeroDescription>
                    Created by <strong>{flashcard.author_name}</strong> —{' '}
                    {createdAt} —{' '}
                    <Badge
                        variant="secondary"
                        className={
                            flashcard.is_public
                                ? 'bg-green-100 text-green-600'
                                : 'bg-rose-100 text-rose-600'
                        }
                    >
                        {flashcard.is_public ? 'Public' : 'Private'}
                    </Badge>
                </HeroDescription>
            </Hero>

            <div className="mx-auto max-w-7xl space-y-6">
                <FlashcardPlayer cards={[flashcard]} />
            </div>
        </div>
    );
}
