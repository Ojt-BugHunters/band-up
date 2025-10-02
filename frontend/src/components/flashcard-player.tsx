'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Rotate3D } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import type { FlashcardItem } from '@/lib/api/dto/flashcarditem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type FlashcardStyle = {
    badge: string;
    border: string;
    background: string;
    label: string;
    term: string;
};

const baseStyle: FlashcardStyle = {
    badge: 'bg-slate-200 text-slate-700',
    border: 'border-slate-200',
    background: 'bg-white',
    label: 'text-slate-400',
    term: 'text-slate-900',
};

const skillStyles: Record<string, FlashcardStyle> = {
    reading: {
        badge: 'bg-sky-100 text-sky-700',
        border: 'border-sky-200',
        background: 'bg-sky-50',
        label: 'text-sky-500',
        term: 'text-sky-700',
    },
    listening: {
        badge: 'bg-emerald-100 text-emerald-700',
        border: 'border-emerald-200',
        background: 'bg-emerald-50',
        label: 'text-emerald-500',
        term: 'text-emerald-700',
    },
    writing: {
        badge: 'bg-rose-100 text-rose-700',
        border: 'border-rose-200',
        background: 'bg-rose-50',
        label: 'text-rose-500',
        term: 'text-rose-700',
    },
    speaking: {
        badge: 'bg-amber-100 text-amber-700',
        border: 'border-amber-200',
        background: 'bg-amber-50',
        label: 'text-amber-500',
        term: 'text-amber-700',
    },
    vocabulary: {
        badge: 'bg-indigo-100 text-indigo-700',
        border: 'border-indigo-200',
        background: 'bg-indigo-50',
        label: 'text-indigo-500',
        term: 'text-indigo-700',
    },
    grammar: {
        badge: 'bg-purple-100 text-purple-700',
        border: 'border-purple-200',
        background: 'bg-purple-50',
        label: 'text-purple-500',
        term: 'text-purple-700',
    },
};

function getFlashcardStyle(skill?: string | null): FlashcardStyle {
    if (!skill) {
        return baseStyle;
    }
    const normalized = skill.trim().toLowerCase();
    return skillStyles[normalized] ?? baseStyle;
}

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
    cards: FlashcardItem[];
    variant?: 'default' | 'large';
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

    const transitionDirection = direction;
    const styles = getFlashcardStyle(currentCard?.flashcard_id);

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex w-full items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <Badge className={cn('uppercase', styles.badge)}>
                        Flashcard {index + 1}
                    </Badge>
                    {currentCard?.flashcard_id && (
                        <span className="text-slate-400">
                            Bộ {currentCard.flashcard_id}
                        </span>
                    )}
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
                            <span>{currentCard?.front}</span>
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
                                {currentCard?.back}
                            </span>
                            {currentCard?.example && (
                                <span className="max-w-2xl text-base text-slate-500 italic">
                                    Ví dụ: {currentCard.example}
                                </span>
                            )}
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
