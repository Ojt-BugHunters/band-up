'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IELTSFeedbackDisplay } from './ielts-writing-feedback';
import { useGetWritingQuestions } from '@/lib/service/test/question';
import { useEvaluateWriting } from '@/lib/service/attempt';
import type { WritingQuestion } from '@/lib/service/test/question/type';
import { EvaluationPayload } from '@/lib/service/attempt';
import { toast } from 'sonner';
import ChatbotLoading from '@/components/chatbot-loading';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { RotateCcw } from 'lucide-react';
import { clearTestLocalStorage } from '@/lib/utils';

interface SubmittedAnswer {
    taskTitle: string;
    questionId: string;
    attemptSectionId: string;
    content: string;
}

const buildPayloads = (
    submittedAnswers: SubmittedAnswer[],
    questions: WritingQuestion[],
): EvaluationPayload[] => {
    const HARDCODED_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    return submittedAnswers.map((answer) => {
        const questionDetail = questions.find(
            (q) => q.id === answer.questionId,
        );

        if (!questionDetail) {
            console.warn(
                `Missing question detail for ID: ${answer.questionId}`,
            );
            return {
                section_id: HARDCODED_ID,
                user_id: HARDCODED_ID,
                essay_content: answer.content,
                task_type: 'TASK_1',
                prompt: 'Instruction not found',
                word_count: 0,
            };
        }

        const taskType =
            questionDetail.content.taskNumber === 1 ? 'TASK_1' : 'TASK_2';

        return {
            section_id: HARDCODED_ID,
            user_id: HARDCODED_ID,
            essay_content: answer.content,
            task_type: taskType,
            prompt: questionDetail.content.instruction,
            word_count: questionDetail.content.minWords,
        };
    });
};

export default function WritingResultPage() {
    const params = useParams();
    const router = useRouter();

    const [answerIds, setAnswerIds] = useState<string[]>([]);
    const [submittedAnswers, setSubmittedAnswers] = useState<SubmittedAnswer[]>(
        [],
    );
    const [quitDialogOpen, setQuitDialogOpen] = useState(false);
    const [quitLoading, setQuitLoading] = useState(false);
    const hasEvaluated = useRef(false);

    const questionIds = useMemo(
        () => submittedAnswers.map((a) => a.questionId),
        [submittedAnswers],
    );

    const { data: questions, isLoading: isLoadingQuestions } =
        useGetWritingQuestions(questionIds);

    const {
        mutate: evaluate,
        data: evaluationResults,
        isPending: isEvaluating,
        isError: isEvaluationError,
    } = useEvaluateWriting();

    useEffect(() => {
        const rawId = params.id;
        if (rawId) {
            const idString = decodeURIComponent(rawId.toString());
            setAnswerIds(idString.split(','));
        }

        const storedJson = localStorage.getItem('submitted_answers');
        if (storedJson) {
            try {
                const parsedData: SubmittedAnswer[] = JSON.parse(storedJson);
                if (Array.isArray(parsedData)) {
                    setSubmittedAnswers(parsedData);
                }
            } catch (error) {
                console.error('Lỗi đọc LocalStorage:', error);
                toast.error('Could not load your answers from storage');
            }
        }
    }, [params]);

    useEffect(() => {
        if (
            answerIds.length > 0 &&
            questions &&
            questions.length > 0 &&
            submittedAnswers.length > 0 &&
            !hasEvaluated.current
        ) {
            const payloads = buildPayloads(submittedAnswers, questions);

            console.log('Ready to evaluate:', { answerIds, payloads });

            evaluate({ answerIds, payloads });

            hasEvaluated.current = true;
        }
    }, [answerIds, questions, submittedAnswers, evaluate]);

    const handleQuitConfirm = async () => {
        try {
            setQuitLoading(true);
            clearTestLocalStorage();
            router.push('/test');
        } finally {
            setQuitLoading(false);
            setQuitDialogOpen(false);
        }
    };

    const handleRetakeTryAgain = () => {
        clearTestLocalStorage();
        router.push('/test');
    };

    if (isLoadingQuestions || isEvaluating) {
        return (
            <div className="bg-background flex h-screen w-full flex-col items-center justify-center gap-4">
                <ChatbotLoading
                    size="lg"
                    message="AI is evaluating your writing test, please wait..."
                />
            </div>
        );
    }

    if (isEvaluationError || (hasEvaluated.current && !evaluationResults)) {
        return (
            <div className="flex h-screen flex-col items-center justify-center p-10 text-center">
                <h2 className="text-destructive mb-2 text-xl font-bold">
                    Evaluation Failed
                </h2>
                <p className="text-muted-foreground">
                    Unable to evaluate your writing at this time.
                </p>
            </div>
        );
    }

    if (!evaluationResults) {
        return null;
    }

    return (
        <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-4xl font-bold tracking-tight">
                        IELTS Writing Feedback
                    </h1>
                    <p className="text-muted-foreground">
                        Detailed analysis of your writing performance
                    </p>
                </div>

                <IELTSFeedbackDisplay data={evaluationResults} />

                <div className="mt-6 flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 gap-2 border-2 border-slate-300 bg-transparent hover:bg-slate-50"
                        onClick={() => setQuitDialogOpen(true)}
                    >
                        Quit test
                    </Button>

                    <Button
                        className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:from-blue-600 hover:to-indigo-600"
                        onClick={handleRetakeTryAgain}
                    >
                        <RotateCcw className="h-4 w-4" />
                        Try again
                    </Button>
                </div>
            </div>

            <ConfirmDialog
                open={quitDialogOpen}
                onOpenChange={setQuitDialogOpen}
                title="Quit the test?"
                description="If you quit, you can view your result in the history tab"
                confirmText="Confirm"
                cancelText="Cancel"
                destructive
                loading={quitLoading}
                onConfirm={handleQuitConfirm}
            />
        </div>
    );
}
