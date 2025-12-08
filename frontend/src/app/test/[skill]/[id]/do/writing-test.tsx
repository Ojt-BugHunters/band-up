'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, PenTool } from 'lucide-react';
import ProgressDialog from '@/components/progress-dialog';
import WritingEditor from './writing-editor';
import { NotFound } from '@/components/not-found';
import { useGetWritingWithQuestions } from '@/lib/service/test/question';
import LiquidLoading from '@/components/ui/liquid-loader';
import { toast } from 'sonner';
import { useSubmitWritingTest } from '@/lib/service/attempt';

type WritingTestProps = {
    mode?: string;
    sections?: string[];
};

export function WritingTest({
    mode = 'full',
    sections = [],
}: WritingTestProps) {
    const {
        data: writingTasks,
        isLoading: isPassageLoading,
        error: isPassageError,
    } = useGetWritingWithQuestions(sections);
    useEffect(() => {
        if (writingTasks && writingTasks.length > 0) {
            writingTasks.forEach((task) => {
                const match = task.title.match(/(\d+)/);
                if (match) {
                    const taskNumber = match[0];

                    const storedAttemptId = localStorage.getItem(
                        `question-${taskNumber}`,
                    );
                    const realQuestionId = task.questions?.[0]?.id;

                    if (storedAttemptId && realQuestionId) {
                        localStorage.setItem(realQuestionId, storedAttemptId);
                        console.log(
                            `Mapped: [Title: ${task.title}] -> [LS Key: question-${taskNumber}] -> [Final: ${realQuestionId} : ${storedAttemptId}]`,
                        );
                    }
                }
            });
        }
    }, [writingTasks]); // Chạy lại khi writingTasks thay đổi (load xong API)

    const [htmlContent, setHtmlContent] = useState('');

    const availableTasks = useMemo(() => {
        return mode === 'full'
            ? (writingTasks ?? [])
            : (writingTasks ?? []).filter((task) => sections.includes(task.id));
    }, [mode, writingTasks, sections]);

    const [currentTask, setCurrentTask] = useState('');

    useEffect(() => {
        if (availableTasks.length > 0) {
            setCurrentTask(availableTasks[0].title);
        } else {
            setCurrentTask('');
        }
    }, [availableTasks]);

    const [task1Response, setTask1Response] = useState('');
    const [task2Response, setTask2Response] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTestStarted, setIsTestStarted] = useState(false);
    useEffect(() => {
        if (availableTasks && availableTasks.length > 0) {
            if (!isTestStarted && timeRemaining === 0) {
                const totalTime = availableTasks.reduce((total, task) => {
                    return total + task.timeLimitSeconds;
                }, 0);
                setTimeRemaining(totalTime);
            }
        }
    }, [availableTasks, isTestStarted, timeRemaining]);
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

    const getTotalQuestions = () => availableTasks?.length;
    const getAnsweredQuestions = () => {
        let answered = 0;
        if (
            availableTasks?.find((task) => task.id === 'section-1') &&
            getWordCount(task1Response) >= 150
        )
            answered++;
        if (
            availableTasks?.find((task) => task.id === 'section-2') &&
            getWordCount(task2Response) >= 250
        )
            answered++;
        return answered;
    };
    const { mutate: submitTest, isPending: isSubmitting } =
        useSubmitWritingTest();

    const handleSubmit = () => {
        const submissionData = availableTasks.map((task) => {
            const isTask1 = task.title.toLowerCase().includes('task 1');
            const taskNumber = isTask1 ? 1 : 2;

            const content = isTask1 ? task1Response : task2Response;
            const questionId = task.questions?.[0]?.id;
            const attemptSectionId = questionId
                ? localStorage.getItem(questionId)
                : null;

            // Lưu mapping lẻ để dùng cho trang Result (như logic cũ của bạn)
            if (questionId) {
                localStorage.setItem(`question-${taskNumber}`, questionId);
            }

            return {
                taskTitle: task.title,
                questionId: questionId!,
                attemptSectionId: attemptSectionId!,
                content: content, // <--- Đây chính là data người dùng nhập
            };
        });

        // --- CÔNG VIỆC 2: Kiểm tra (Logging) ---
        console.log('📦 Dữ liệu chuẩn bị nộp:', submissionData);

        // --- CÔNG VIỆC 3: Lưu Backup vào LocalStorage (YÊU CẦU MỚI) ---
        // Lưu nguyên mảng submissionData vào key 'submitted_answers'
        localStorage.setItem(
            'submitted_answers',
            JSON.stringify(submissionData),
        );

        // --- CÔNG VIỆC 4: Validate (Kiểm tra lỗi) ---
        // Đảm bảo không gửi đi dữ liệu thiếu ID quan trọng
        const isMissingIds = submissionData.some(
            (d) => !d.questionId || !d.attemptSectionId,
        );
        if (isMissingIds) {
            toast.error('Lỗi dữ liệu hệ thống. Vui lòng tải lại trang.');
            return;
        }

        // --- CÔNG VIỆC 5: Gọi API (Submit) ---
        // Gọi Mutation để bắn dữ liệu lên Server
        submitTest(submissionData);
    };

    const getUnansweredQuestions = () => {
        const unanswered = [];
        if (
            availableTasks?.find((task) => task.id === 'task1') &&
            getWordCount(task1Response) < 150
        ) {
            unanswered.push({
                id: 1,
                type: 'writing-task',
                question: 'Task 1: Academic Writing',
            });
        }
        if (
            availableTasks?.find((task) => task.id === 'task2') &&
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
        getTotalQuestions() === 2
            ? currentTask === 'Writing Task 1'
                ? writingTasks && writingTasks[0]
                : writingTasks && writingTasks[1]
            : writingTasks && writingTasks[0];

    useEffect(() => {
        if (currentTaskData?.metadata) {
            try {
                const parsedMetadata = JSON.parse(currentTaskData.metadata);
                setHtmlContent(parsedMetadata.htmlContent ?? '');
            } catch (error) {
                console.error('Error parsing metadata:', error);
                setHtmlContent('');
            }
        }
    }, [currentTaskData]);

    const currentResponse =
        currentTask === 'Writing Task 1' ? task1Response : task2Response;
    const setCurrentResponse =
        currentTask === 'Writing Task 1' ? setTask1Response : setTask2Response;

    if (isPassageLoading || isSubmitting) {
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
                                            (task) =>
                                                task.title === 'Writing Task 1',
                                        ) && (
                                            <TabsTrigger
                                                value="Writing Task 1"
                                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                            >
                                                Task 1 - Academic Writing
                                            </TabsTrigger>
                                        )}
                                        {availableTasks.find(
                                            (task) =>
                                                task.title === 'Writing Task 2',
                                        ) && (
                                            <TabsTrigger
                                                value="Writing Task 2"
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
                                taskNumber={
                                    currentTask === 'Writing Task 1' ? 1 : 2
                                }
                                title={currentTaskData?.title ?? ''}
                                content={htmlContent}
                                instructions={
                                    'You should spend about 20 minutes on this task. Write at least 150 words'
                                }
                                minWords={150}
                                value={currentResponse}
                                onChange={setCurrentResponse}
                                layout="split"
                                showInstructions={true}
                            />
                        </div>
                        <div className="col-span-1">
                            <WritingEditor
                                taskNumber={
                                    currentTask === 'Writing Task 2' ? 2 : 1
                                }
                                title={currentTaskData?.title ?? ''}
                                content={htmlContent}
                                instructions={
                                    'You should spend about 40 minutes on this task. Write about the following topic:'
                                }
                                minWords={250}
                                value={currentResponse}
                                onChange={setCurrentResponse}
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
