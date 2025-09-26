'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText } from 'lucide-react';
import ProgressDialog from '@/components/progress-dialog';
import QuestionPanel from '@/components/question-panel';
import ReadingPassage from '@/components/reading-passage';
import { mockPassages } from '../../constants/sample-data';

type ReadingTestProps = {
    mode?: string;
    sections?: string[];
};

export function ReadingTest({
    mode = 'full',
    sections = [],
}: ReadingTestProps) {
    console.log(sections);
    const availablePassages =
        mode === 'full'
            ? mockPassages
            : mockPassages.filter((passage) => sections.includes(passage.id));
    const [currentPassage, setCurrentPassage] = useState(
        availablePassages[0]?.id ?? '',
    );
    const timeLimit = availablePassages.length * 20 * 60;
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timeRemaining, setTimeRemaining] = useState(timeLimit);
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
        return availablePassages.reduce(
            (total, passage) => total + passage.questions.length,
            0,
        );
    };

    const getAnsweredQuestions = () => {
        return Object.keys(answers).filter(
            (key) => answers[Number.parseInt(key)].trim() !== '',
        ).length;
    };

    const getUnansweredQuestions = () => {
        const allQuestions = availablePassages.flatMap(
            (passage) => passage.questions,
        );
        return allQuestions.filter(
            (q) => !answers[q.id] || answers[q.id].trim() === '',
        );
    };

    const currentPassageData = availablePassages.find(
        (p) => p.id === currentPassage,
    );

    if (availablePassages.length === 0) {
        return <div>No passage available</div>;
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
                                        {availablePassages.findIndex(
                                            (p) => p.id === currentPassage,
                                        ) + 1}{' '}
                                        of {availablePassages.length}
                                    </Badge>
                                </div>

                                <Tabs
                                    value={currentPassage}
                                    onValueChange={setCurrentPassage}
                                    className="w-full"
                                >
                                    {availablePassages.length > 1 && (
                                        <TabsList
                                            className={`bg-muted grid w-full ${
                                                availablePassages.length === 2
                                                    ? 'grid-cols-2'
                                                    : 'grid-cols-3'
                                            }`}
                                        >
                                            {availablePassages.map(
                                                (passage, index) => (
                                                    <TabsTrigger
                                                        key={passage.id}
                                                        value={passage.id}
                                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"
                                                    >
                                                        Passage{' '}
                                                        {passage.id
                                                            .split('-')
                                                            .pop()}
                                                    </TabsTrigger>
                                                ),
                                            )}
                                        </TabsList>
                                    )}
                                </Tabs>
                            </CardHeader>

                            <CardContent className="h-[calc(100%-120px)]">
                                {currentPassageData && (
                                    <ReadingPassage
                                        title={currentPassageData.title}
                                        content={currentPassageData.content}
                                    />
                                )}
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
