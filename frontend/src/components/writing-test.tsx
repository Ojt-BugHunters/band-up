'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, PenTool } from 'lucide-react';
import ProgressDialog from '@/components/progress-dialog';
import WritingEditor from '@/components/writing-editor';
import { writingTasks } from '../../constants/sample-data';

type WritingTestProps = {
    mode?: string;
    sections?: string[];
};

export function WritingTest({
    mode = 'full',
    sections = [],
}: WritingTestProps) {
    const availableTasks =
        mode === 'full'
            ? [writingTasks.task1, writingTasks.task2]
            : [writingTasks.task1, writingTasks.task2].filter((task) =>
                  sections.includes(task.id),
              );

    const [currentTask, setCurrentTask] = useState<string>(
        availableTasks[0]?.id ?? 'task1',
    );
    const [task1Response, setTask1Response] = useState('');
    const [task2Response, setTask2Response] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60 minutes
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
            availableTasks.find((task) => task.id === 'task1') &&
            getWordCount(task1Response) >= writingTasks.task1.minWords
        )
            answered++;
        if (
            availableTasks.find((task) => task.id === 'task2') &&
            getWordCount(task2Response) >= writingTasks.task2.minWords
        )
            answered++;
        return answered;
    };

    const getUnansweredQuestions = () => {
        const unanswered = [];
        if (
            availableTasks.find((task) => task.id === 'task1') &&
            getWordCount(task1Response) < writingTasks.task1.minWords
        ) {
            unanswered.push({
                id: 1,
                type: 'writing-task',
                question: 'Task 1: Academic Writing',
            });
        }
        if (
            availableTasks.find((task) => task.id === 'task2') &&
            getWordCount(task2Response) < writingTasks.task2.minWords
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
        currentTask === 'task1' ? writingTasks.task1 : writingTasks.task2;
    const currentResponse =
        currentTask === 'task1' ? task1Response : task2Response;
    const setCurrentResponse =
        currentTask === 'task1' ? setTask1Response : setTask2Response;

    if (availableTasks.length === 0) {
        return <div>No tasks available</div>;
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
                    {/* Task Navigation */}
                    {availableTasks.length > 1 && (
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg text-balance">
                                        Writing Tasks
                                    </CardTitle>
                                    <div className="flex items-center gap-4">
                                        {availableTasks.find(
                                            (task) => task.id === 'task1',
                                        ) && (
                                            <div className="text-muted-foreground text-sm">
                                                Task 1:{' '}
                                                {getWordCount(task1Response)}{' '}
                                                words
                                                {getWordCount(task1Response) >=
                                                    writingTasks.task1
                                                        .minWords && (
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
                                            (task) => task.id === 'task2',
                                        ) && (
                                            <div className="text-muted-foreground text-sm">
                                                Task 2:{' '}
                                                {getWordCount(task2Response)}{' '}
                                                words
                                                {getWordCount(task2Response) >=
                                                    writingTasks.task2
                                                        .minWords && (
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
                                            (task) => task.id === 'task1',
                                        ) && (
                                            <TabsTrigger
                                                value="task1"
                                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                            >
                                                Task 1 - Academic Writing
                                                <Badge
                                                    variant={
                                                        getWordCount(
                                                            task1Response,
                                                        ) >=
                                                        writingTasks.task1
                                                            .minWords
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    className="ml-2 text-xs"
                                                >
                                                    {
                                                        writingTasks.task1
                                                            .minWords
                                                    }{' '}
                                                    words min
                                                </Badge>
                                            </TabsTrigger>
                                        )}
                                        {availableTasks.find(
                                            (task) => task.id === 'task2',
                                        ) && (
                                            <TabsTrigger
                                                value="task2"
                                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                            >
                                                Task 2 - Essay Writing
                                                <Badge
                                                    variant={
                                                        getWordCount(
                                                            task2Response,
                                                        ) >=
                                                        writingTasks.task2
                                                            .minWords
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    className="ml-2 text-xs"
                                                >
                                                    {
                                                        writingTasks.task2
                                                            .minWords
                                                    }{' '}
                                                    words min
                                                </Badge>
                                            </TabsTrigger>
                                        )}
                                    </TabsList>
                                </Tabs>
                            </CardHeader>
                        </Card>
                    )}

                    {/* Writing Editor */}
                    <div className="grid h-[calc(100vh-280px)] grid-cols-2 gap-6">
                        <div className="col-span-1">
                            <WritingEditor
                                taskNumber={currentTask === 'task1' ? 1 : 2}
                                title={currentTaskData.title}
                                prompt={currentTaskData.prompt}
                                instructions={currentTaskData.instructions}
                                minWords={currentTaskData.minWords}
                                value={currentResponse}
                                onChange={setCurrentResponse}
                                imageUrl={currentTaskData.imageUrl}
                                layout="split"
                                showInstructions={true}
                            />
                        </div>
                        <div className="col-span-1">
                            <WritingEditor
                                taskNumber={currentTask === 'task1' ? 1 : 2}
                                title={currentTaskData.title}
                                prompt={currentTaskData.prompt}
                                instructions={currentTaskData.instructions}
                                minWords={currentTaskData.minWords}
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
