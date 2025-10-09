'use client';

import { LearnModeDialog } from '@/components/learn-mode-dialog';
import { QuizInterface } from '@/components/quiz-interface';
import { DeckCard } from '@/lib/api/dto/flashcard';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function FlashCardTestPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const raw = localStorage.getItem(`deck:${id}`);
    const deckCard: DeckCard = raw ? JSON.parse(raw) : null;
    const [learnMode, setLearnMode] = useState<'fast' | 'all' | null>(null);
    const [deck, setDeck] = useState<DeckCard | null>(null);

    const handleModeSelect = (mode: 'fast' | 'all') => {
        setLearnMode(mode);
        setDeck(deckCard);
    };

    const handleComplete = () => {
        setLearnMode(null);
        setDeck(null);
        router.push(`/flashcard/${id}`);
    };
    return (
        <div className="bg-background mt-20 min-h-screen dark:bg-[#0a092d]">
            <div className="bg-white dark:bg-[#0a092d]">
                <div className="mx-auto max-w-7xl px-6 py-6">
                    {!learnMode && (
                        <LearnModeDialog onModeSelect={handleModeSelect} />
                    )}
                    {learnMode && deck && (
                        <QuizInterface
                            deck={deck}
                            mode={learnMode}
                            onComplete={handleComplete}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
