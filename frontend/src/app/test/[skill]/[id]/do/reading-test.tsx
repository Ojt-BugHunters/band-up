'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText } from 'lucide-react';
import ProgressDialog, { Question } from '@/components/progress-dialog';
import QuestionPanel from '@/components/question-panel';
import ReadingPassage from '@/components/reading-passage';
import { NotFound } from '@/components/not-found';
import { useGetSectionsWithQuestions } from '@/lib/service/test/question/api';
import LiquidLoading from '@/components/ui/liquid-loader';
import { ReadingQuestion } from '@/lib/service/test/question';
import { useSubmitAnswers } from '@/lib/service/attempt';
import { useRouter } from 'next/navigation';

type ReadingTestProps = {
    mode?: string;
    sections?: string[];
};

export function ReadingTest({
    mode = 'full',
    sections = [],
}: ReadingTestProps) {
    const router = useRouter();
    const {
        data: passages,
        isLoading: isPassageLoading,
        error: isPassageError,
    } = useGetSectionsWithQuestions(sections);
    const { mutate: submitAnswers } = useSubmitAnswers();

    const availablePassages =
        mode === 'full'
            ? passages
            : passages?.filter((passage) => sections.includes(passage.id));

    const [currentPassage, setCurrentPassage] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTestStarted, setIsTestStarted] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    useEffect(() => {
        if (availablePassages && availablePassages.length > 0) {
            if (!currentPassage) {
                setCurrentPassage(availablePassages[0].id);
            }

            if (!isTestStarted && timeRemaining === 0) {
                const totalTime = availablePassages.reduce((total, passage) => {
                    return total + passage.timeLimitSeconds;
                }, 0);
                setTimeRemaining(totalTime);
            }
        }
    }, [availablePassages, currentPassage, isTestStarted, timeRemaining]);

    useEffect(() => {
        if (!isTestStarted) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    setIsTestStarted(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isTestStarted]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = () => {
        const answerArray = Object.keys(answers).map((questionId) => {
            const question = availablePassages
                ?.flatMap((passage) => passage.questions)
                .find((q) => q.id === questionId);

            return {
                questionNumber: question?.content.questionNumber || 0,
                answerContent: answers[questionId] || '',
            };
        });

        const attemptId = localStorage.getItem('currentAttemptId');

        if (!attemptId) {
            console.error('No attemptId found in localStorage');
            return;
        }

        submitAnswers(
            {
                attemptId,
                answerArray,
            },
            {
                onSuccess: (data) => {
                    localStorage.setItem(
                        'latestTestResult',
                        JSON.stringify(data),
                    );
                    router.push('/test/result');
                },
            },
        );
    };

    const normalizeReadingQuestion = (
        readingQuestion: ReadingQuestion,
    ): Question => {
        return {
            id: readingQuestion.content.questionNumber,
            type: readingQuestion.content.type,
            question: `Question ${readingQuestion.content.questionNumber}`,
        };
    };

    const totalQuestions =
        availablePassages?.reduce(
            (total, passage) => total + passage.questions.length,
            0,
        ) ?? 0;

    const getUnansweredQuestions = (): Question[] => {
        const allQuestions = availablePassages?.flatMap(
            (passage) => passage.questions,
        );

        const unansweredReadingQuestions =
            allQuestions?.filter(
                (q) => !answers[q.id] || answers[q.id].trim() === '',
            ) ?? [];

        return unansweredReadingQuestions.map(normalizeReadingQuestion);
    };

    const answeredQuestions = totalQuestions - getUnansweredQuestions().length;

    const currentPassageData = availablePassages?.find(
        (p) => p.id === currentPassage,
    );

    if (availablePassages?.length === 0) {
        return <NotFound />;
    }
    if (isPassageLoading) {
        return (
            <div className="bg-background flex min-h-screen w-full items-center justify-center rounded-lg border p-4">
                <LiquidLoading />
            </div>
        );
    }

    if (isPassageError) {
        return <NotFound />;
    }

    return (
        <div className="bg-background min-h-screen">
            <header className="border-border bg-card border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FileText className="text-primary h-6 w-6" />
                                <h1 className="text-xl font-semibold text-balance">
                                    IELTS Reading Test
                                </h1>
                            </div>
                            <Badge variant="secondary" className="text-sm">
                                Academic Module
                            </Badge>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4" />
                                <span className="font-mono text-lg">
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>

                            <ProgressDialog
                                totalQuestions={totalQuestions}
                                answeredQuestions={answeredQuestions}
                                unansweredQuestions={getUnansweredQuestions()}
                                onSubmit={handleSubmit}
                            />

                            {!isTestStarted ? (
                                <Button
                                    onClick={() => setIsTestStarted(true)}
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    Start Test
                                </Button>
                            ) : (
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsTestStarted(false)}
                                >
                                    End Test
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <div className="grid h-[calc(100vh-140px)] grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg text-balance">
                                        Reading Passages
                                    </CardTitle>
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {availablePassages
                                            ? availablePassages.findIndex(
                                                  (p) =>
                                                      p.id === currentPassage,
                                              ) + 1
                                            : 0}{' '}
                                        of {availablePassages?.length ?? 0}
                                    </Badge>
                                </div>

                                <Tabs
                                    value={currentPassage}
                                    onValueChange={setCurrentPassage}
                                    className="w-full"
                                >
                                    {availablePassages &&
                                        availablePassages.length > 1 && (
                                            <TabsList
                                                className={`bg-muted grid w-full ${
                                                    availablePassages.length ===
                                                    2
                                                        ? 'grid-cols-2'
                                                        : 'grid-cols-3'
                                                }`}
                                            >
                                                {availablePassages.map(
                                                    (passage) => (
                                                        <TabsTrigger
                                                            key={passage.id}
                                                            value={passage.id}
                                                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"
                                                        >
                                                            Passage{' '}
                                                            {passage.orderIndex}
                                                        </TabsTrigger>
                                                    ),
                                                )}
                                            </TabsList>
                                        )}
                                </Tabs>
                            </CardHeader>

                            <CardContent className="p-0">
                                <div className="h-full overflow-auto">
                                    {' '}
                                    {currentPassageData && (
                                        <ReadingPassage
                                            title={currentPassageData.title}
                                            metadata={
                                                currentPassageData.metadata
                                            }
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        {currentPassageData && (
                            <QuestionPanel
                                questions={currentPassageData.questions}
                                answers={answers}
                                onAnswerChange={handleAnswerChange}
                                passageTitle={currentPassageData.title}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
