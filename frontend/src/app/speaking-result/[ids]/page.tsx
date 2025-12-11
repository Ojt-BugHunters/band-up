'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
// Import wrapper "SpeakingResultDisplay" và type từ file đó
import SpeakingResultDisplay, {
    SpeakingEvaluationResponse,
} from './speaking-result-display';
import { ChatbotLoading } from '@/components/chatbot-loading';
import { toast } from 'sonner';
import { useEvaluateSpeaking } from '@/lib/service/attempt';

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
    const {
        mutate: evaluateSpeaking,
        data: evaluationResults,
        isPending: isEvaluating,
        isSuccess: isEvaluated,
    } = useEvaluateSpeaking();

    const [gradingData, setGradingData] = useState<GradingPayload[]>([]);
    const [hasCalledEvaluation, setHasCalledEvaluation] = useState(false);

    useEffect(() => {
        const rawIds = params.ids;

        if (rawIds) {
            const idString = decodeURIComponent(
                Array.isArray(rawIds) ? rawIds[0] : rawIds,
            );
            const answerIds = idString.split(',');

            const allKeys = Object.keys(localStorage);
            const partKeys = allKeys.filter((key) => key.startsWith('Part '));

            partKeys.sort((a, b) => {
                const numA = parseInt(a.replace('Part ', ''));
                const numB = parseInt(b.replace('Part ', ''));
                return numA - numB;
            });

            console.log('Các Part tìm thấy trong Storage (đã sort):', partKeys);

            const payloads: GradingPayload[] = [];

            answerIds.forEach((ansId, index) => {
                const s3Key = localStorage.getItem(ansId);

                const partKey = partKeys[index];
                const partJson = partKey ? localStorage.getItem(partKey) : null;

                if (s3Key && partJson) {
                    try {
                        const partData: PartMetadata = JSON.parse(partJson);

                        payloads.push({
                            answerId: ansId,
                            session_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                            user_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                            audio_url: s3Key,
                            task_type: partData.task_type,
                            prompt: partData.prompt,
                            duration_seconds: partData.duration_seconds,
                        });
                    } catch (e) {
                        console.error(`Lỗi parse JSON cho key ${partKey}`, e);
                    }
                } else {
                    console.warn(
                        `Thiếu dữ liệu cho cặp: ID=${ansId} - PartKey=${partKey}`,
                    );
                }
            });

            setGradingData(payloads);
            if (payloads.length > 0 && !hasCalledEvaluation) {
                setHasCalledEvaluation(true);
                evaluateSpeaking(payloads);
            }
        }
    }, [params]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-100 to-orange-100">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="rounded-3xl bg-white p-6 shadow-2xl md:p-8">
                    <div className="mb-6">
                        <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-900">
                            IELTS Speaking Results
                        </h1>
                        <p className="text-base text-slate-600">
                            AI-Powered Performance Analysis
                        </p>
                    </div>

                    {isEvaluating ? (
                        <div className="flex h-96 flex-col items-center justify-center">
                            <ChatbotLoading
                                size="lg"
                                message="AI is evaluating your speaking test, please wait..."
                            />
                        </div>
                    ) : (
                        // Ép kiểu về SpeakingEvaluationResponse[] (type mới) cho an toàn
                        <SpeakingResultDisplay
                            results={
                                evaluationResults as unknown as SpeakingEvaluationResponse[]
                            }
                        />
                    )}
                </div>
            </div>
        </main>
    );
}
