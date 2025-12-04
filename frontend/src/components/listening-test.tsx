'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Headphones } from 'lucide-react';
import ProgressDialog, { Question } from '@/components/progress-dialog';
import QuestionPanel from '@/components/question-panel';
import AudioPlayer from '@/components/audio-player';
import { NotFound } from './not-found';
import {
    ListeningQuestion,
    useGetListeningWithQuestions,
} from '@/lib/service/test/question';
import LiquidLoading from './ui/liquid-loader';

type ListeningTestProps = {
    mode?: string;
    sections?: string[];
};

export function ListeningTest({
    mode = 'full',
    sections = [],
}: ListeningTestProps) {
    const {
        data: listeningSections,
        isLoading: isSectionsLoading,
        error: isSectionsError,
    } = useGetListeningWithQuestions(sections);

    const availableSections =
        mode === 'full'
            ? listeningSections
            : listeningSections?.filter((section) =>
                  sections.includes(section.id),
              );

    const [currentPassage, setCurrentPassage] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTestStarted, setIsTestStarted] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    useEffect(() => {
        if (availableSections && availableSections.length > 0) {
            if (!currentPassage) {
                setCurrentPassage(availableSections[0].id);
            }

            if (!isTestStarted && timeRemaining === 0) {
                const totalTime = availableSections.reduce((total, section) => {
                    return total + section.timeLimitSeconds;
                }, 0);
                setTimeRemaining(totalTime);
            }
        }
    }, [availableSections, currentPassage, isTestStarted, timeRemaining]);

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

    const normalizeListeningQuestion = (
        listeningQuestion: ListeningQuestion,
    ): Question => {
        return {
            id: listeningQuestion.content.questionNumber,
            type: listeningQuestion.content.type,
            question: `Question ${listeningQuestion.content.questionNumber}`,
        };
    };

    const totalQuestions =
        availableSections?.reduce(
            (total, passage) => total + passage.questions.length,
            0,
        ) ?? 0;

    const getUnansweredQuestions = (): Question[] => {
        const allQuestions = availableSections?.flatMap(
            (passage) => passage.questions,
        );

        const unansweredReadingQuestions =
            allQuestions?.filter(
                (q) => !answers[q.id] || answers[q.id].trim() === '',
            ) ?? [];

        return unansweredReadingQuestions.map(normalizeListeningQuestion);
    };

    const answeredQuestions = totalQuestions - getUnansweredQuestions().length;

    const currentSectionData = availableSections?.find(
        (s) => s.id === currentPassage,
    );

    if (availableSections?.length === 0) {
        return <NotFound />;
    }

    if (isSectionsLoading) {
        return (
            <div className="bg-background flex min-h-screen w-full items-center justify-center rounded-lg border p-4">
                <LiquidLoading />
            </div>
        );
    }

    if (isSectionsError) {
        return <NotFound />;
    }
    return (
        <div className="bg-background min-h-screen">
            <header className="border-border bg-card border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Headphones className="text-primary h-6 w-6" />
                                <h1 className="text-xl font-semibold text-balance">
                                    IELTS Listening Test
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
                        {currentSectionData && (
                            <QuestionPanel
                                questions={currentSectionData.questions}
                                answers={answers}
                                onAnswerChange={handleAnswerChange}
                                passageTitle={currentSectionData.title}
                            />
                        )}
                    </div>
                    <div className="lg:col-span-1">
                        <AudioPlayer
                            sections={availableSections}
                            currentSection={currentPassage}
                            onSectionChange={setCurrentPassage}
                            isTestStarted={isTestStarted}
                            onTestStart={() => setIsTestStarted(true)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
