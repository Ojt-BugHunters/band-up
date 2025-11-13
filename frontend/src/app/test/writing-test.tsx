'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, PenTool } from 'lucide-react';
import ProgressDialog from './progress-dialog';
import WritingEditor from '@/components/writing-editor';
import { writingTasks } from '../../../constants/sample-data';
import { NotFound } from '@/components/not-found';

type WritingTestProps = {
    mode?: string;
    sections?: string[];
};

export function WritingTest({
    mode = 'full',
    sections = [],
}: WritingTestProps) {
    console.log(sections);
    const availableTasks =
        mode === 'full'
            ? writingTasks
            : writingTasks.filter((task) => sections.includes(task.id));
    const [currentTask, setCurrentTask] = useState(availableTasks[0]?.id ?? '');
    const [task1Response, setTask1Response] = useState('');
    const [task2Response, setTask2Response] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(60 * 60);
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

    const getWordCount = (text: string) => {
        return text
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
    };

    const getTotalQuestions = () => availableTasks.length;

    const getAnsweredQuestions = () => {
        let answered = 0;
        if (
            availableTasks.find((task) => task.id === 'section-1') &&
            getWordCount(task1Response) >= 150
        )
            answered++;
        if (
            availableTasks.find((task) => task.id === 'section-2') &&
            getWordCount(task2Response) >= 250
        )
            answered++;
        return answered;
    };

    const getUnansweredQuestions = () => {
        const unanswered = [];
        if (
            availableTasks.find((task) => task.id === 'task1') &&
            getWordCount(task1Response) < 150
        ) {
            unanswered.push({
                id: 1,
                type: 'writing-task',
                question: 'Task 1: Academic Writing',
            });
        }
        if (
            availableTasks.find((task) => task.id === 'task2') &&
            getWordCount(task2Response) < 250
        ) {
            unanswered.push({
                id: 2,
                type: 'writing-task',
                question: 'Task 2: Essay Writing',
            });
        }
        return unanswered;
    };

    const currentTaskData =
        currentTask === 'section-1' ? writingTasks[0] : writingTasks[1];
    const currentResponse =
        currentTask === 'section-1' ? task1Response : task2Response;
    const setCurrentResponse =
        currentTask === 'section-1' ? setTask1Response : setTask2Response;

    if (availableTasks.length === 0) {
        return <NotFound />;
    }

    return (
        <div className="bg-background min-h-screen">
            <header className="border-border bg-card border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <PenTool className="text-primary h-6 w-6" />
                                <h1 className="text-xl font-semibold text-balance">
                                    IELTS Writing Test
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
                <div className="space-y-6">
                    {availableTasks.length > 1 && (
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg text-balance">
                                        Writing Tasks
                                    </CardTitle>
                                    <div className="flex items-center gap-4">
                                        {availableTasks.find(
                                            (task) => task.id === 'section-1',
                                        ) && (
                                            <div className="text-muted-foreground text-sm">
                                                Task 1:{' '}
                                                {getWordCount(task1Response)}{' '}
                                                words
                                                {getWordCount(task1Response) >=
                                                    150 && (
                                                    <Badge
                                                        variant="default"
                                                        className="ml-2 text-xs"
                                                    >
                                                        Complete
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                        {availableTasks.find(
                                            (task) => task.id === 'section-2',
                                        ) && (
                                            <div className="text-muted-foreground text-sm">
                                                Task 2:{' '}
                                                {getWordCount(task2Response)}{' '}
                                                words
                                                {getWordCount(task2Response) >=
                                                    250 && (
                                                    <Badge
                                                        variant="default"
                                                        className="ml-2 text-xs"
                                                    >
                                                        Complete
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Tabs
                                    value={currentTask}
                                    onValueChange={(value) =>
                                        setCurrentTask(value)
                                    }
                                    className="w-full"
                                >
                                    <TabsList className="bg-muted grid w-full grid-cols-2">
                                        {availableTasks.find(
                                            (task) => task.id === 'section-1',
                                        ) && (
                                            <TabsTrigger
                                                value="section-1"
                                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                            >
                                                Task 1 - Academic Writing
                                            </TabsTrigger>
                                        )}
                                        {availableTasks.find(
                                            (task) => task.id === 'section-2',
                                        ) && (
                                            <TabsTrigger
                                                value="section-2"
                                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                            >
                                                Task 2 - Essay Writing
                                            </TabsTrigger>
                                        )}
                                    </TabsList>
                                </Tabs>
                            </CardHeader>
                        </Card>
                    )}

                    <div className="grid h-[calc(100vh-280px)] grid-cols-2 gap-6">
                        <div className="col-span-1">
                            <WritingEditor
                                taskNumber={currentTask === 'section-1' ? 1 : 2}
                                title={currentTaskData.title}
                                content={currentTaskData.content}
                                instructions={
                                    'You should spend about 20 minutes on this task. Write at least 150 words'
                                }
                                minWords={150}
                                value={currentResponse}
                                onChange={setCurrentResponse}
                                imageUrl={currentTaskData.imageUrl}
                                layout="split"
                                showInstructions={true}
                            />
                        </div>
                        <div className="col-span-1">
                            <WritingEditor
                                taskNumber={currentTask === 'section-2' ? 2 : 1}
                                title={currentTaskData.title}
                                content={currentTaskData.content}
                                instructions={
                                    'You should spend about 40 minutes on this task. Write about the following topic:'
                                }
                                minWords={250}
                                value={currentResponse}
                                onChange={setCurrentResponse}
                                imageUrl={currentTaskData.imageUrl}
                                layout="split"
                                showInstructions={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
