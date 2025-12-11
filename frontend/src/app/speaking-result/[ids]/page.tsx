'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SpeakingResultDisplay, {
    SpeakingEvaluationResponse,
} from './speaking-result-display';
import { ChatbotLoading } from '@/components/chatbot-loading';
import { useEvaluateSpeaking } from '@/lib/service/attempt';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { clearTestLocalStorage } from '@/lib/utils';

type GradingPayload = {
    answerId: string;
    session_id: string;
    user_id: string;
    audio_url: string;
    task_type: string;
    prompt: string;
    duration_seconds: number;
};

type PartMetadata = {
    task_type: string;
    prompt: string;
    duration_seconds: number;
};

export default function Page() {
    const params = useParams();
    const router = useRouter();
    const [results, setResults] = useState<SpeakingEvaluationResponse[] | null>(
        null,
    );
    const [payloads, setPayloads] = useState<GradingPayload[]>([]);
    const [quitDialogOpen, setQuitDialogOpen] = useState(false);
    const [quitLoading, setQuitLoading] = useState(false);

    const {
        mutate: evaluateSpeaking,
        isPending: isEvaluating,
        isError,
        error,
    } = useEvaluateSpeaking();

    useEffect(() => {
        const rawIds = params.ids;
        if (!rawIds) return;

        const idString = decodeURIComponent(
            Array.isArray(rawIds) ? rawIds[0] : rawIds,
        );
        const storageKey = `speaking_results_${idString}`;

        const cachedData = localStorage.getItem(storageKey);
        if (cachedData) {
            try {
                const parsedResults = JSON.parse(cachedData);
                setResults(parsedResults);
                return;
            } catch (e) {
                localStorage.removeItem(storageKey);
            }
        }

        const answerIds = idString.split(',');
        const allKeys = Object.keys(localStorage);
        const partKeys = allKeys
            .filter((key) => key.startsWith('Part '))
            .sort((a, b) => {
                const numA = parseInt(a.replace('Part ', ''));
                const numB = parseInt(b.replace('Part ', ''));
                return numA - numB;
            });

        const preparedPayloads: GradingPayload[] = [];

        answerIds.forEach((ansId, index) => {
            const s3Key = localStorage.getItem(ansId);
            const partKey = partKeys[index];
            const partJson = partKey ? localStorage.getItem(partKey) : null;

            if (s3Key && partJson) {
                try {
                    const partData: PartMetadata = JSON.parse(partJson);
                    preparedPayloads.push({
                        answerId: ansId,
                        session_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        user_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                        audio_url: s3Key,
                        task_type: partData.task_type,
                        prompt: partData.prompt,
                        duration_seconds: partData.duration_seconds,
                    });
                } catch (e) {
                    // Silent error
                }
            }
        });

        if (preparedPayloads.length > 0) {
            setPayloads(preparedPayloads);
        }
    }, [params.ids]);

    useEffect(() => {
        if (payloads.length === 0 || results) return;

        const rawIds = params.ids as string;
        const idString = decodeURIComponent(
            Array.isArray(rawIds) ? rawIds[0] : rawIds,
        );
        const storageKey = `speaking_results_${idString}`;

        evaluateSpeaking(payloads, {
            onSuccess: (data) => {
                try {
                    localStorage.setItem(storageKey, JSON.stringify(data));
                } catch (e) {
                    // Silent error
                }

                setResults(data as unknown as SpeakingEvaluationResponse[]);
            },
            onError: () => {
                // Error handled by hook
            },
        });
    }, [payloads, results, params.ids, evaluateSpeaking]);

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

    if (isEvaluating || (!results && payloads.length > 0)) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="container mx-auto max-w-6xl px-4 py-8">
                    <div className="rounded-2xl border-0 bg-white p-6 shadow-xl md:p-8">
                        <div className="flex h-96 flex-col items-center justify-center">
                            <ChatbotLoading
                                size="lg"
                                message="AI is evaluating your speaking test, please wait..."
                            />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="rounded-2xl border-0 bg-white p-6 shadow-xl md:p-8">
                    <div className="mb-6">
                        <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                            IELTS Speaking Results
                        </h1>
                        <p className="text-base text-slate-600">
                            AI-Powered Performance Analysis
                        </p>
                    </div>

                    {isError && !results && (
                        <div className="py-10">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Evaluation Failed</AlertTitle>
                                <AlertDescription>
                                    {error instanceof Error
                                        ? error.message
                                        : 'Something went wrong while evaluating your test.'}
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {results && (
                        <>
                            <SpeakingResultDisplay results={results} />

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
                        </>
                    )}

                    {!isEvaluating && !results && payloads.length === 0 && (
                        <div className="flex h-64 flex-col items-center justify-center text-slate-400">
                            No test data found
                        </div>
                    )}
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
        </main>
    );
}
