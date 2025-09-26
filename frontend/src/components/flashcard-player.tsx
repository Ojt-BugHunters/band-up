'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Rotate3D } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import type { Flashcard } from '@/lib/api/dto/flashcards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getFlashcardStyle } from '@/lib/flashcard-style';
import { cn } from '@/lib/utils';

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

type FlashcardPlayerProps = {
    cards: Flashcard[];
};

export default function FlashcardPlayer({ cards }: FlashcardPlayerProps) {
    const total = cards.length;
    const [index, setIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [direction, setDirection] = useState<1 | -1>(1);

    useEffect(() => {
        setIndex(0);
        setIsFlipped(false);
        setDirection(1);
    }, [total, cards]);

    const currentCard = useMemo(() => {
        if (!total) return undefined;
        return cards[Math.min(index, total - 1)];
    }, [cards, index, total]);

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
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500">
                Không tìm thấy flashcard nào phù hợp.
            </div>
        );
    }

    const createdAt = currentCard?.created_at
        ? new Date(currentCard.created_at)
        : undefined;
    const createdLabel =
        createdAt && !Number.isNaN(createdAt.getTime())
            ? createdAt.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
              })
            : 'Unknown date';

    const transitionDirection = direction;
    const styles = getFlashcardStyle(currentCard?.author_name);

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex w-full items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <Badge className={cn('uppercase', styles.badge)}>
                        {currentCard?.title}
                    </Badge>
                    <span>{createdLabel}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-slate-400">
                        <ArrowLeft className="h-3 w-3" />
                        <span>Quay lại</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                        <ArrowRight className="h-3 w-3" />
                        <span>Tiếp theo</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                        <Rotate3D className="h-3 w-3" />
                        <span>Lật thẻ</span>
                    </div>
                </div>
            </div>

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
                            styles.border,
                            styles.background,
                        )}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <div
                            className={cn(
                                'absolute inset-0 flex flex-col items-center justify-center gap-8 text-center text-3xl font-semibold',
                                styles.term,
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
                                    styles.label,
                                )}
                            >
                                Thuật ngữ
                            </span>
                            <span>{currentCard?.title}</span>
                        </div>
                        <div
                            className="absolute inset-0 flex flex-col items-center justify-center gap-8 text-center text-xl text-slate-700"
                            style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateX(180deg)',
                                opacity: isFlipped ? 1 : 0,
                            }}
                        >
                            <span
                                className={cn(
                                    'text-base tracking-[0.4em] uppercase',
                                    styles.label,
                                )}
                            >
                                Định nghĩa
                            </span>
                            <span className="max-w-2xl leading-relaxed text-balance">
                                {currentCard?.description}
                            </span>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={handlePrev}
                    className="gap-2"
                    aria-label="Flashcard trước"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Trước
                </Button>
                <Badge variant="secondary" className="px-4 py-1 text-sm">
                    {index + 1} / {total}
                </Badge>
                <Button
                    onClick={handleNext}
                    className="gap-2"
                    aria-label="Flashcard tiếp theo"
                >
                    Tiếp
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
