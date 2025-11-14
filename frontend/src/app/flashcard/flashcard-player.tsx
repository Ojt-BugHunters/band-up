'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { DeckCard } from '@/lib/service/flashcard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LiquidLoading from '@/components/ui/liquid-loader';

const slideVariants = {
    initial: (direction: 1 | -1) => ({
        opacity: 0,
        x: direction === 1 ? 120 : -120,
        rotateX: 0,
    }),
    exit: (direction: 1 | -1) => ({
        opacity: 0,
        x: direction === 1 ? -120 : 120,
        rotateX: 0,
    }),
};

export default function FlashcardPlayer(props: { deckCards?: DeckCard }) {
    if (!props.deckCards) return <LiquidLoading />;
    return <FlashcardPlayerInner deckCards={props.deckCards} />;
}

function FlashcardPlayerInner({ deckCards }: { deckCards?: DeckCard }) {
    const total = deckCards?.cards.length ?? 0;
    const [index, setIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [direction, setDirection] = useState<1 | -1>(1);

    useEffect(() => {
        setIndex(0);
        setIsFlipped(false);
        setDirection(1);
    }, [total, deckCards]);

    const currentCard = useMemo(() => {
        if (!total) return undefined;
        return deckCards?.cards[Math.min(index, total - 1)];
    }, [deckCards, index, total]);

    const handleNext = useCallback(() => {
        if (!total) return;
        setDirection(1);
        setIsFlipped(false);
        setIndex((prev) => (prev + 1) % total);
    }, [total]);

    const handlePrev = useCallback(() => {
        if (!total) return;
        setDirection(-1);
        setIsFlipped(false);
        setIndex((prev) => (prev - 1 + total) % total);
    }, [total]);

    const handleFlip = useCallback(() => {
        if (!total) return;
        setIsFlipped((prev) => !prev);
    }, [total]);

    useEffect(() => {
        if (!total) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                handleNext();
            }
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                handlePrev();
            }
            if (event.key === ' ') {
                event.preventDefault();
                handleFlip();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, handleFlip, total]);

    if (!total) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500 dark:border-gray-700 dark:bg-[#2e3856] dark:text-gray-400">
                Không tìm thấy flashcard nào phù hợp.
            </div>
        );
    }

    const transitionDirection = direction;

    return (
        <div className="mt-8 flex flex-col items-center gap-6">
            <div
                className="relative h-80 w-full max-w-3xl select-none"
                style={{ perspective: '1600px' }}
            >
                <AnimatePresence
                    mode="wait"
                    initial={false}
                    custom={transitionDirection}
                >
                    <motion.div
                        key={currentCard?.id ?? 'empty'}
                        custom={transitionDirection}
                        variants={slideVariants}
                        onClick={handleFlip}
                        initial="initial"
                        animate={{
                            opacity: 1,
                            x: 0,
                            rotateX: isFlipped ? 180 : 0,
                        }}
                        exit="exit"
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className={cn(
                            'absolute inset-0 cursor-pointer rounded-3xl border p-14 shadow-2xl transition-colors',
                            'border-slate-200 bg-white dark:border-gray-700 dark:bg-[#2e3856] dark:shadow-black/40',
                        )}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <div
                            className={cn(
                                'absolute inset-0 flex flex-col items-center justify-center gap-8 text-center text-3xl font-semibold',
                                'text-gray-900 dark:text-white',
                            )}
                            style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateX(0deg)',
                                opacity: isFlipped ? 0 : 1,
                            }}
                        >
                            <span
                                className={cn(
                                    'text-base tracking-[0.4em] uppercase',
                                    'text-gray-500 dark:text-gray-400',
                                )}
                            >
                                Terminology
                            </span>
                            <span>{currentCard?.front}</span>
                        </div>
                        <div
                            className={cn(
                                'absolute inset-0 flex flex-col items-center justify-center gap-8 text-center text-xl',
                                'text-slate-700 dark:text-gray-300',
                            )}
                            style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateX(180deg)',
                                opacity: isFlipped ? 1 : 0,
                            }}
                        >
                            <span
                                className={cn(
                                    'text-base tracking-[0.4em] uppercase',
                                    'text-gray-500 dark:text-gray-400',
                                )}
                            >
                                Definition
                            </span>
                            <span className="max-w-2xl leading-relaxed text-balance">
                                {currentCard?.back}
                            </span>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={handlePrev}
                    className="gap-2 dark:border-gray-700 dark:bg-[#2e3856] dark:text-white dark:hover:bg-[#3d4a6b]"
                    aria-label="Flashcard trước"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                </Button>
                <Badge
                    variant="secondary"
                    className="px-4 py-1 text-sm dark:bg-[#2e3856] dark:text-gray-300"
                >
                    {index + 1} / {total}
                </Badge>
                <Button
                    onClick={handleNext}
                    className="gap-2 dark:bg-blue-600 dark:hover:bg-blue-700"
                    aria-label="Flashcard tiếp theo"
                >
                    Next
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
