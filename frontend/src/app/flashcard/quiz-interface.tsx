'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeckCard, Card as FlashCard } from '@/lib/service/flashcard';
import LiquidLoading from '@/components/ui/liquid-loader';
import { motion } from 'framer-motion';

interface QuizInterfaceProps {
    deck: DeckCard;
    mode: 'fast' | 'all';
    onComplete: () => void;
}

interface Question {
    id: string;
    question: string;
    correctAnswer: string;
    options: string[];
    cardId: string;
}

interface CardProgress {
    cardId: string;
    correctCount: number;
}

export function QuizInterface({ deck, mode, onComplete }: QuizInterfaceProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [cardProgress, setCardProgress] = useState<CardProgress[]>([]);
    const [completedCards, setCompletedCards] = useState<Set<string>>(
        new Set(),
    );
    const [isComplete, setIsComplete] = useState(false);

    const requiredCorrectAnswers = mode === 'fast' ? 1 : 2;

    const generateQuestions = useCallback((cards: FlashCard[]): Question[] => {
        const questions: Question[] = [];

        cards.forEach((card) => {
            const backAnswers = cards
                .map((c) => c.back)
                .filter((b) => b !== card.back);
            const wrongBackAnswers = shuffleArray(backAnswers).slice(0, 3);
            const backOptions = shuffleArray([card.back, ...wrongBackAnswers]);

            questions.push({
                id: `${card.id}-front-standard`,
                question: card.front,
                correctAnswer: card.back,
                options: backOptions,
                cardId: card.id,
            });

            const frontAnswers = cards
                .map((c) => c.front)
                .filter((f) => f !== card.front);
            const wrongFrontAnswers = shuffleArray(frontAnswers).slice(0, 3);
            const frontOptions = shuffleArray([
                card.front,
                ...wrongFrontAnswers,
            ]);

            questions.push({
                id: `${card.id}-back-standard`,
                question: card.back,
                correctAnswer: card.front,
                options: frontOptions,
                cardId: card.id,
            });

            questions.push({
                id: `${card.id}-definition`,
                question: `What is the definition of "${card.front}"?`,
                correctAnswer: card.back,
                options: shuffleArray([
                    card.back,
                    ...shuffleArray(backAnswers).slice(0, 3),
                ]),
                cardId: card.id,
            });

            questions.push({
                id: `${card.id}-term-match`,
                question: `Which term matches this definition: "${card.back}"?`,
                correctAnswer: card.front,
                options: shuffleArray([
                    card.front,
                    ...shuffleArray(frontAnswers).slice(0, 3),
                ]),
                cardId: card.id,
            });

            if (cards.length >= 4) {
                questions.push({
                    id: `${card.id}-select-correct`,
                    question: `Select the correct answer for: ${card.front}`,
                    correctAnswer: card.back,
                    options: shuffleArray([
                        card.back,
                        ...shuffleArray(backAnswers).slice(0, 3),
                    ]),
                    cardId: card.id,
                });
            }

            if (cards.length >= 4) {
                questions.push({
                    id: `${card.id}-complete-pair`,
                    question: `Complete the pair: ${card.front} → ?`,
                    correctAnswer: card.back,
                    options: shuffleArray([
                        card.back,
                        ...shuffleArray(backAnswers).slice(0, 3),
                    ]),
                    cardId: card.id,
                });
            }
        });

        return shuffleArray(questions);
    }, []);

    useEffect(() => {
        const generatedQuestions = generateQuestions(deck.cards);
        setQuestions(generatedQuestions);

        const initialProgress = deck.cards.map((card) => ({
            cardId: card.id,
            correctCount: 0,
        }));
        setCardProgress(initialProgress);
    }, [deck, generateQuestions]);

    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const handleAnswerSelect = (answer: string) => {
        if (showFeedback) return;

        setSelectedAnswer(answer);
        const currentQuestion = questions[currentQuestionIndex];
        const correct = answer === currentQuestion.correctAnswer;

        setIsCorrect(correct);
        setShowFeedback(true);

        if (correct) {
            const updatedProgress = cardProgress.map((progress) => {
                if (progress.cardId === currentQuestion.cardId) {
                    const newCount = progress.correctCount + 1;
                    if (newCount >= requiredCorrectAnswers) {
                        setCompletedCards((prev) =>
                            new Set(prev).add(progress.cardId),
                        );
                    }
                    return { ...progress, correctCount: newCount };
                }
                return progress;
            });
            setCardProgress(updatedProgress);
        }
    };

    const handleNext = () => {
        setSelectedAnswer(null);
        setShowFeedback(false);
        setIsCorrect(false);

        const remainingQuestions = questions.filter((q) => {
            const progress = cardProgress.find((p) => p.cardId === q.cardId);
            return !progress || progress.correctCount < requiredCorrectAnswers;
        });

        if (
            remainingQuestions.length === 0 ||
            (isCorrect && currentQuestionIndex === questions.length - 1)
        ) {
            setIsComplete(true);
        } else if (isCorrect) {
            let nextIndex = currentQuestionIndex + 1;
            while (nextIndex < questions.length) {
                const nextQuestion = questions[nextIndex];
                const progress = cardProgress.find(
                    (p) => p.cardId === nextQuestion.cardId,
                );
                if (
                    !progress ||
                    progress.correctCount < requiredCorrectAnswers
                ) {
                    break;
                }
                nextIndex++;
            }

            if (nextIndex >= questions.length) {
                nextIndex = 0;
                while (nextIndex < questions.length) {
                    const nextQuestion = questions[nextIndex];
                    const progress = cardProgress.find(
                        (p) => p.cardId === nextQuestion.cardId,
                    );
                    if (
                        !progress ||
                        progress.correctCount < requiredCorrectAnswers
                    ) {
                        break;
                    }
                    nextIndex++;
                }
            }

            setCurrentQuestionIndex(nextIndex);
        }
    };

    const calculateProgress = () => {
        const totalRequired = deck.cards.length * requiredCorrectAnswers; // 5 or 10
        const currentProgress = cardProgress.reduce(
            (sum, p) => sum + Math.min(p.correctCount, requiredCorrectAnswers),
            0,
        );
        return (currentProgress / totalRequired) * 100;
    };

    if (questions.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                    <p className="text-muted-foreground mt-4">
                        <LiquidLoading />
                    </p>
                </div>
            </div>
        );
    }

    if (isComplete) {
        return (
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white to-blue-50 p-4 dark:from-[#1a1a2e] dark:to-[#16213e]">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'mirror',
                    }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
                />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className="z-10"
                >
                    <Card className="w-full max-w-md text-center shadow-xl backdrop-blur-sm">
                        <CardHeader>
                            <motion.div
                                initial={{ rotate: 0 }}
                                animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                                transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    repeatType: 'mirror',
                                }}
                                className="bg-primary/10 mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full"
                            >
                                <Trophy className="text-primary h-12 w-12" />
                            </motion.div>

                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                            >
                                <CardTitle className="text-primary text-4xl font-extrabold tracking-wide">
                                    Congratulations!
                                </CardTitle>
                            </motion.div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <p className="text-muted-foreground text-lg">
                                You have mastered all {deck.cards.length} cards
                                in{' '}
                                <span className="text-primary font-semibold">
                                    {mode === 'fast'
                                        ? 'Learn Fast'
                                        : 'Learn All'}
                                </span>{' '}
                                mode!
                            </p>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Button
                                    onClick={onComplete}
                                    className="w-full text-lg font-medium shadow-md transition-all hover:scale-105"
                                >
                                    Back to Deck
                                </Button>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    className="pointer-events-none absolute inset-0 z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                >
                    <Sparkles className="absolute top-1/3 left-1/4 h-8 w-8 text-yellow-400" />
                    <Sparkles className="absolute right-1/4 bottom-1/4 h-10 w-10 text-blue-400" />
                    <Sparkles className="absolute top-1/4 right-1/2 h-12 w-12 text-pink-400" />
                </motion.div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = calculateProgress();

    return (
        <div className="min-h-screen p-4 py-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">{deck.title}</h1>
                        <span className="text-muted-foreground text-sm">
                            {completedCards.size} / {deck.cards.length} cards
                            mastered
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <Card className="transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="text-xl leading-relaxed text-balance">
                            {currentQuestion.question}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrectAnswer =
                                option === currentQuestion.correctAnswer;
                            const showCorrect = showFeedback && isCorrectAnswer;
                            const showIncorrect =
                                showFeedback && isSelected && !isCorrect;

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={showFeedback}
                                    className={cn(
                                        'w-full rounded-lg border-2 p-4 text-left transition-all duration-200',
                                        'hover:border-primary hover:bg-accent',
                                        'disabled:cursor-not-allowed',
                                        isSelected &&
                                            !showFeedback &&
                                            'border-primary bg-accent',
                                        showCorrect &&
                                            'border-green-500 bg-green-500/10',
                                        showIncorrect &&
                                            'border-destructive bg-destructive/10',
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="leading-relaxed text-balance">
                                            {option}
                                        </span>
                                        {showCorrect && (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        )}
                                        {showIncorrect && (
                                            <XCircle className="text-destructive h-5 w-5" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </CardContent>
                </Card>

                {showFeedback && (
                    <Card
                        className={cn(
                            'animate-in fade-in slide-in-from-bottom-4 duration-300',
                            isCorrect
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-destructive bg-destructive/10',
                        )}
                    >
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                {isCorrect ? (
                                    <>
                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                        <div>
                                            <p className="font-semibold text-green-700 dark:text-green-400">
                                                Correct!
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                Great job!
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="text-destructive h-6 w-6" />
                                        <div>
                                            <p className="text-destructive font-semibold">
                                                Incorrect
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                Correct answer:{' '}
                                                <span className="font-medium">
                                                    {
                                                        currentQuestion.correctAnswer
                                                    }
                                                </span>
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <Button onClick={handleNext}>
                                {isCorrect ? 'Next' : 'Try Again'}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
