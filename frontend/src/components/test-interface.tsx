'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    CheckCircle2,
    XCircle,
    Trophy,
    X,
    BookOpen,
    Brain,
    TestTubes,
    ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
    id: string;
    question: string;
    correctAnswer: string;
    options: string[];
}

interface Answer {
    questionId: string;
    selectedAnswer: string;
}

interface TestInterfaceProps {
    questions: Question[];
    onComplete: () => void;
    title?: string;
}

export function TestInterface({
    questions,
    onComplete,
    title = 'Bài kiểm tra',
}: TestInterfaceProps) {
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [showResults, setShowResults] = useState(false);
    const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleAnswerSelect = (
        questionId: string,
        answer: string,
        index: number,
    ) => {
        setAnswers((prev) => {
            const existing = prev.find((a) => a.questionId === questionId);
            if (existing) {
                return prev.map((a) =>
                    a.questionId === questionId
                        ? { ...a, selectedAnswer: answer }
                        : a,
                );
            }
            return [...prev, { questionId, selectedAnswer: answer }];
        });

        // Auto-scroll to next question
        setTimeout(() => {
            if (index < questions.length - 1) {
                questionRefs.current[index + 1]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }, 300);
    };

    const calculateResults = () => {
        let correct = 0;
        let incorrect = 0;

        questions.forEach((question) => {
            const answer = answers.find((a) => a.questionId === question.id);
            if (answer) {
                if (answer.selectedAnswer === question.correctAnswer) {
                    correct++;
                } else {
                    incorrect++;
                }
            } else {
                incorrect++;
            }
        });

        return { correct, incorrect, total: questions.length };
    };

    const handleSubmit = () => {
        setShowResults(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const answeredCount = answers.length;
    const progress = (answeredCount / questions.length) * 100;

    if (showResults) {
        const results = calculateResults();
        const percentage = Math.round((results.correct / results.total) * 100);

        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md text-center shadow-lg">
                    <CardHeader>
                        <div className="bg-primary/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                            <Trophy className="text-primary h-10 w-10" />
                        </div>
                        <CardTitle className="text-3xl font-bold">
                            Kết quả bài kiểm tra
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="rounded-lg border-2 border-green-500 bg-green-500/10 p-4">
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    <span className="text-2xl font-bold text-green-600">
                                        {results.correct}
                                    </span>
                                    <span className="text-muted-foreground">
                                        câu đúng
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-lg border-2 border-red-500 bg-red-500/10 p-4">
                                <div className="flex items-center justify-center gap-2">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                    <span className="text-2xl font-bold text-red-600">
                                        {results.incorrect}
                                    </span>
                                    <span className="text-muted-foreground">
                                        câu sai
                                    </span>
                                </div>
                            </div>

                            <div className="bg-muted/50 rounded-lg border p-4">
                                <p className="text-lg font-semibold">
                                    Điểm số: {percentage}%
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    {results.correct} / {results.total} câu
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={onComplete}
                            className="w-full"
                            size="lg"
                        >
                            Hoàn thành
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <header className="bg-background border-b px-10 py-5 shadow-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="border-muted hover:bg-muted/30 flex items-center gap-2 rounded-xl bg-transparent px-4 py-2 text-base font-medium"
                                >
                                    <BookOpen className="h-5 w-5 text-rose-500" />
                                    Flashcards
                                    <ChevronDown className="h-4 w-4 opacity-70" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="start"
                                className="w-48 rounded-xl shadow-md"
                            >
                                <DropdownMenuLabel className="text-muted-foreground">
                                    Study Modes
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="hover:bg-muted/40 focus:bg-muted/40 flex cursor-pointer items-center gap-2">
                                    <Brain className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-semibold">
                                        Learn
                                    </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-muted/40 focus:bg-muted/40 flex cursor-pointer items-center gap-2">
                                    <TestTubes className="h-4 w-4 text-green-500" />
                                    <span className="text-sm font-semibold">
                                        Test
                                    </span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2">
                        <h1 className="text-foreground text-lg font-semibold tracking-tight">
                            {title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onComplete}
                            className="h-10 w-10"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-grow p-4 py-8">
                <div className="mx-auto max-w-3xl space-y-6">
                    <div className="bg-card sticky top-4 z-10 rounded-lg border p-4 shadow-md">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">
                                    Tiến độ làm bài
                                </h2>
                                <span className="text-muted-foreground text-sm">
                                    {answeredCount} / {questions.length} câu
                                </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    </div>

                    {questions.map((question, index) => {
                        const answer = answers.find(
                            (a) => a.questionId === question.id,
                        );
                        const isAnswered = !!answer;

                        return (
                            <div
                                key={question.id}
                                ref={(el) => {
                                    questionRefs.current[index] = el;
                                }}
                            >
                                <Card
                                    className={cn(
                                        'transition-all duration-300',
                                        isAnswered && 'border-primary',
                                    )}
                                >
                                    <CardHeader>
                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                                                {index + 1}
                                            </div>
                                            <CardTitle className="text-lg leading-relaxed text-balance">
                                                {question.question}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {question.options.map(
                                            (option, optionIndex) => {
                                                const isSelected =
                                                    answer?.selectedAnswer ===
                                                    option;

                                                return (
                                                    <button
                                                        key={optionIndex}
                                                        onClick={() =>
                                                            handleAnswerSelect(
                                                                question.id,
                                                                option,
                                                                index,
                                                            )
                                                        }
                                                        className={cn(
                                                            'w-full rounded-lg border-2 p-4 text-left transition-all duration-200',
                                                            'hover:border-primary hover:bg-accent',
                                                            isSelected &&
                                                                'border-primary bg-primary/10',
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={cn(
                                                                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                                                                    isSelected
                                                                        ? 'border-primary bg-primary'
                                                                        : 'border-muted-foreground',
                                                                )}
                                                            >
                                                                {isSelected && (
                                                                    <div className="bg-primary-foreground h-2 w-2 rounded-full" />
                                                                )}
                                                            </div>
                                                            <span className="leading-relaxed text-balance">
                                                                {option}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            },
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}

                    <div className="sticky bottom-4 flex justify-center">
                        <Button
                            onClick={handleSubmit}
                            size="lg"
                            disabled={answeredCount < questions.length}
                            className="min-w-[200px] shadow-lg"
                        >
                            Nộp bài ({answeredCount}/{questions.length})
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
