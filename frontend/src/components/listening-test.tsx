'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

    const [currentSection, setCurrentSection] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTestStarted, setIsTestStarted] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    useEffect(() => {
        if (availableSections && availableSections.length > 0) {
            if (!currentSection) {
                setCurrentSection(availableSections[0].id);
            }

            if (!isTestStarted && timeRemaining === 0) {
                const totalTime = availableSections.reduce((total, section) => {
                    return total + section.timeLimitSeconds;
                }, 0);
                setTimeRemaining(totalTime);
            }
        }
    }, [availableSections, currentSection, isTestStarted, timeRemaining]);

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
            (total, section) => total + section.questions.length,
            0,
        ) ?? 0;

    const getUnansweredQuestions = (): Question[] => {
        if (!availableSections) return [];

        const allQuestions = availableSections.flatMap(
            (section) => section.questions,
        ) as unknown as ListeningQuestion[];

        const unansweredListeningQuestions = allQuestions.filter(
            (q) => !answers[q.id] || answers[q.id].trim() === '',
        );

        return unansweredListeningQuestions.map(normalizeListeningQuestion);
    };

    const answeredQuestions = totalQuestions - getUnansweredQuestions().length;

    const currentSectionData = availableSections?.find(
        (s) => s.id === currentSection,
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
                        <Card className="h-full">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg text-balance">
                                        Audio Player
                                    </CardTitle>
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {availableSections
                                            ? availableSections.findIndex(
                                                  (s) =>
                                                      s.id === currentSection,
                                              ) + 1
                                            : 0}{' '}
                                        of {availableSections?.length ?? 0}
                                    </Badge>
                                </div>

                                <Tabs
                                    value={currentSection}
                                    onValueChange={setCurrentSection}
                                    className="w-full"
                                >
                                    {availableSections &&
                                        availableSections.length > 1 && (
                                            <TabsList
                                                className={`bg-muted grid w-full ${
                                                    availableSections.length ===
                                                    2
                                                        ? 'grid-cols-2'
                                                        : availableSections.length ===
                                                            3
                                                          ? 'grid-cols-3'
                                                          : 'grid-cols-4'
                                                }`}
                                            >
                                                {availableSections.map(
                                                    (section) => (
                                                        <TabsTrigger
                                                            key={section.id}
                                                            value={section.id}
                                                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"
                                                        >
                                                            Section{' '}
                                                            {section.orderIndex}
                                                        </TabsTrigger>
                                                    ),
                                                )}
                                            </TabsList>
                                        )}
                                </Tabs>
                            </CardHeader>

                            <CardContent className="p-0">
                                <div className="h-full overflow-auto">
                                    {currentSectionData &&
                                        availableSections && (
                                            <AudioPlayer
                                                sections={availableSections.map(
                                                    (section) => ({
                                                        id: section.id,
                                                        title: section.title,
                                                        audioUrl:
                                                            section.cloudfrontUrl ||
                                                            '',
                                                        duration:
                                                            section.timeLimitSeconds,
                                                        metadata:
                                                            section.metadata,
                                                    }),
                                                )}
                                                currentSection={currentSection}
                                                onSectionChange={
                                                    setCurrentSection
                                                }
                                                isTestStarted={isTestStarted}
                                                onTestStart={() =>
                                                    setIsTestStarted(true)
                                                }
                                            />
                                        )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        {currentSectionData && (
                            <QuestionPanel
                                questions={
                                    currentSectionData.questions as unknown as ListeningQuestion[]
                                }
                                answers={answers}
                                onAnswerChange={handleAnswerChange}
                                passageTitle={currentSectionData.title}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
