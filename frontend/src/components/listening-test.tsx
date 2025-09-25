'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Headphones } from 'lucide-react';
import ProgressDialog from '@/components/progress-dialog';
import QuestionPanel from '@/components/question-panel';
import AudioPlayer from '@/components/audio-player';
import { mockListeningSections } from '../../constants/sample-data';

type ListeningTestProps = {
    mode?: string;
    sections?: string[];
};

export function ListeningTest({
    mode = 'full',
    sections = [],
}: ListeningTestProps) {
    const availableSections =
        mode === 'full'
            ? mockListeningSections
            : mockListeningSections.filter((section) =>
                  sections.includes(section.id),
              );

    const [currentSection, setCurrentSection] = useState(
        availableSections[0]?.id ?? '',
    );
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timeRemaining, setTimeRemaining] = useState(2400);
    const [isTestStarted, setIsTestStarted] = useState(false);

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

    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const getTotalQuestions = () => {
        return availableSections.reduce(
            (total, section) => total + section.questions.length,
            0,
        );
    };

    const getAnsweredQuestions = () => {
        return Object.keys(answers).filter(
            (key) => answers[Number.parseInt(key)].trim() !== '',
        ).length;
    };

    const getUnansweredQuestions = () => {
        const allQuestions = availableSections.flatMap(
            (section) => section.questions,
        );
        return allQuestions.filter(
            (q) => !answers[q.id] || answers[q.id].trim() === '',
        );
    };

    const currentSectionData = availableSections.find(
        (s) => s.id === currentSection,
    );

    if (availableSections.length === 0) {
        return <div>No sections available</div>;
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
                                totalQuestions={getTotalQuestions()}
                                answeredQuestions={getAnsweredQuestions()}
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
                <div className="grid h-[calc(100vh-140px)] grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="lg:col-span-1">
                        <AudioPlayer
                            sections={availableSections}
                            currentSection={currentSection}
                            onSectionChange={setCurrentSection}
                            isTestStarted={isTestStarted}
                            onTestStart={() => setIsTestStarted(true)}
                        />
                    </div>

                    <div className="lg:col-span-1">
                        {currentSectionData && (
                            <QuestionPanel
                                questions={currentSectionData.questions}
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
