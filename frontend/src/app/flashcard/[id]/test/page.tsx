'use client';

import React from 'react';
import { useState } from 'react';
import { TestStartDialog } from '@/components/test-start-dialog';
import { TestInterface } from '@/components/test-interface';
import { DeckCard } from '@/lib/api/dto/flashcard';
import { useParams, useRouter } from 'next/navigation';

export default function TestPage() {
    const { id } = useParams<{ id: string }>();
    const raw = localStorage.getItem(`deck:${id}`);
    const deckCard: DeckCard = raw ? JSON.parse(raw) : null;
    const [hasStarted, setHasStarted] = useState(false);
    const [deck, setDeck] = useState<DeckCard | null>(null);
    const router = useRouter();

    const handleStart = () => {
        setHasStarted(true);
        setDeck(deckCard);
    };

    const handleComplete = () => {
        setDeck(null);
        router.push(`/flashcard/${id}`);
    };

    console.log(deckCard);

    return (
        <div className="bg-background min-h-screen">
            {!hasStarted && (
                <TestStartDialog
                    onStart={handleStart}
                    questionCount={deckCard.cards.length}
                />
            )}
            {hasStarted && deck && (
                <TestInterface
                    deck={deck}
                    onComplete={handleComplete}
                    title={deck.title}
                />
            )}
        </div>
    );
}
