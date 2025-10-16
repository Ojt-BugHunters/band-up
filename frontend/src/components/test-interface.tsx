'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
    id: string;
    question: string;
    correctAnswer: string;
    options: string[];
}

interface TestInterfaceProps {
    questions: Question[];
    onComplete: () => void;
}

interface Answer {
    questionId: string;
    selectedAnswer: string;
}

export function TestInterface({ questions, onComplete }: TestInterfaceProps) {
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
        <div className="min-h-screen p-4 py-8">
            <div className="mx-auto max-w-3xl space-y-6">
                {/* Progress Header */}
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

                {/* Questions */}
                <div className="space-y-6">
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
                </div>

                {/* Submit Button */}
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
        </div>
    );
}
