import { useMutation, useQuery } from '@tanstack/react-query';
import { deserialize, fetchWrapper, throwIfError } from '..';
import { toast } from 'sonner';
import {
    Attempt,
    AttemptDetail,
    AttemptHistoryItem,
    AttemptTest,
    BandScoreResponse,
    CreateAttemptResponse,
    CreateAttemptSectionResponse,
    EvaluationPayload,
    GetSpeakingUrlPayload,
    GradingPayload,
    SpeakingEvaluationResponse,
    SubmitAnswerParams,
    SubmitResponse,
    WritingSubmission,
} from './type';
import { useRouter } from 'next/navigation';
import { FeedbackData } from '@/app/writing-result/[id]/ielts-writing-feedback';
import { putFileToS3WithProgress } from '../s3-upload';

export function useCreateAttempt() {
    return useMutation({
        mutationFn: async ({
            id,
            startAt,
        }: {
            id: string;
            startAt: string;
        }) => {
            const response = await fetchWrapper(`/attempts/${id}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startAt,
                }),
            });

            await throwIfError(response);
            const data = await response.json();
            return data as CreateAttemptResponse;
        },
        onError: (error) => {
            // toast.error(error?.message ?? 'Join Test Fail');
        },
        onSuccess: () => {
            // toast.success('Join Test Successfully');
        },
    });
}
let sectionCounter = 1;
export function useCreateAttemptSection() {
    return useMutation({
        mutationFn: async ({
            attemptId,
            sectionId,
            startAt,
        }: {
            attemptId: string;
            sectionId: string;
            startAt: string;
        }) => {
            const response = await fetchWrapper(
                `/attempt-sections/${attemptId}/section/${sectionId}`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        startAt,
                    }),
                },
            );

            await throwIfError(response);
            const data = await response.json();
            return data as CreateAttemptSectionResponse;
        },
        onError: (error) => {
            // toast.error(error?.message ?? 'Fail to save attempt');
        },
        onSuccess: (data) => {
            // toast.success('Save attempt successfully. Try your best!');
            if (data?.id) {
                localStorage.setItem(`question-${sectionCounter}`, data.id);
                sectionCounter++;
            }
        },
    });
}

export function useSubmitAnswers() {
    return useMutation({
        mutationFn: async ({ attemptId, answerArray }: SubmitAnswerParams) => {
            const response = await fetchWrapper(
                `/answers/ielts/test/${attemptId}`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        answers: answerArray,
                    }),
                },
            );

            await throwIfError(response);
            const data = await response.json();
            return data as BandScoreResponse;
        },
        onError: (error) => {
            // toast.error(error?.message ?? 'Fail to submit answers');
        },
        onSuccess: (data) => {
            // toast.success(
            //     'Test submitted successfully! Your score: ' + data.bandScore,
            // );
        },
    });
}

export const useGetAttemptHistory = (userId: string) => {
    return useQuery({
        queryKey: ['attempt-history', userId],
        enabled: !!userId,
        staleTime: Infinity,
        refetchOnWindowFocus: true,
        queryFn: async (): Promise<AttemptHistoryItem[]> => {
            const attemptRes = await fetchWrapper(
                `/attempts/by-user/${userId}`,
            );
            const attempts = await deserialize<Attempt[]>(attemptRes);

            const finishedAttempts = attempts.filter(
                (a) => a.status === 'ENDED',
            );

            if (finishedAttempts.length === 0) return [];

            const testIds = Array.from(
                new Set(finishedAttempts.map((a) => a.testId)),
            );

            const testsMap = new Map<string, AttemptTest>();

            await Promise.all(
                testIds.map(async (testId) => {
                    const res = await fetchWrapper(`/tests/${testId}`);
                    const test = await deserialize<AttemptTest>(res);
                    testsMap.set(testId, test);
                }),
            );

            const history: AttemptHistoryItem[] = finishedAttempts
                .map((attempt) => {
                    const test = testsMap.get(attempt.testId);
                    if (!test) return null;
                    return { attempt, test };
                })
                .filter((item): item is AttemptHistoryItem => item !== null);

            history.sort(
                (a, b) =>
                    new Date(b.attempt.startAt).getTime() -
                    new Date(a.attempt.startAt).getTime(),
            );

            return history;
        },
    });
};

export const useGetAttemptDetail = (id: string) => {
    return useQuery({
        queryKey: ['history', id],
        queryFn: async () => {
            const response = await fetchWrapper(`/attempts/${id}/detail`);
            return await deserialize<AttemptDetail>(response);
        },
        staleTime: Infinity,
        refetchOnWindowFocus: true,
    });
};

export function useSubmitWritingTest() {
    const router = useRouter();

    return useMutation({
        mutationFn: async (submissions: WritingSubmission[]) => {
            const promises = submissions.map(async (sub) => {
                const url = `/answers/writing/${sub.attemptSectionId}/${sub.questionId}/save`;

                const response = await fetchWrapper(url, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        answerContent: sub.content,
                    }),
                });

                await throwIfError(response);
                return response.json() as Promise<SubmitResponse>;
            });

            const results = await Promise.all(promises);
            return results;
        },
        onError: (error) => {
            console.error(error);
            // toast.error(error?.message ?? 'Fail to submit writing test');
        },
        onSuccess: (data) => {
            // toast.success('Submitted successfully!');
            const ids = data.map((item) => item.id).join(',');
            router.push(`/writing-result/${ids}`);
        },
    });
}

interface EvaluateParams {
    answerIds: string[];
    payloads: EvaluationPayload[];
}

export function useEvaluateWriting() {
    return useMutation({
        mutationFn: async ({ answerIds, payloads }: EvaluateParams) => {
            if (answerIds.length !== payloads.length) {
                throw new Error('Answer IDs and Payloads length mismatch');
            }

            const promises = answerIds.map(async (answerId, index) => {
                const payload = payloads[index];

                const url = `/v1/evaluations/writing/evaluate/${answerId}`;

                const response = await fetchWrapper(url, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                await throwIfError(response);

                return response.json() as Promise<FeedbackData>;
            });

            return await Promise.all(promises);
        },
        onError: (error) => {
            console.error('Evaluation Error:', error);
            // toast.error(error?.message ?? 'Failed to evaluate writing');
        },
        onSuccess: (data) => {
            // toast.success('Evaluation completed successfully!');
            console.log('Evaluation Results:', data);
        },
    });
}

export function useGetSpeakingUploadUrl() {
    return useMutation({
        mutationFn: async ({
            attemptSectionId,
            audioName,
        }: GetSpeakingUrlPayload) => {
            const response = await fetchWrapper(
                `/answers/speaking/${attemptSectionId}/upload-url`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        audioName: audioName,
                    }),
                },
            );

            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            // toast.error(error?.message ?? 'Fail to get speaking upload url');
        },
        onSuccess: () => {
            // toast.success('Speaking upload url retrieved successfully!');
        },
    });
}

export type SpeakingSubmission = {
    attemptSectionId: string;
    file: File;
};

export type SaveSpeakingResponse = {
    questionContent: string;
    answerContent: string;
    s3Key: string;
    answerId: string;
};

export function useSubmitSpeakingTest() {
    const router = useRouter();

    return useMutation({
        mutationFn: async (submissions: SpeakingSubmission[]) => {
            const promises = submissions.map(async (sub) => {
                const getUrlEndpoint = `/answers/speaking/${sub.attemptSectionId}/upload-url`;

                const urlResponse = await fetchWrapper(getUrlEndpoint, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        audioName: sub.file.name,
                    }),
                });

                await throwIfError(urlResponse);
                const { uploadUrl } = await urlResponse.json();

                await putFileToS3WithProgress({
                    url: uploadUrl,
                    file: sub.file,
                    contentType: sub.file.type,
                    expectedStatuses: [200, 201, 204],
                });

                const saveEndpoint = `/answers/speaking/${sub.attemptSectionId}/save`;

                const saveResponse = await fetchWrapper(saveEndpoint, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        audioName: sub.file.name,
                    }),
                });

                await throwIfError(saveResponse);

                return (await saveResponse.json()) as SaveSpeakingResponse;
            });

            return Promise.all(promises);
        },
        onError: (error) => {
            console.error('Speaking submission error:', error);
            // toast.error(
            //     error instanceof Error
            //         ? error.message
            //         : 'Fail to submit speaking test',
            // );
        },
        onSuccess: (data) => {
            // toast.success('Speaking test submitted successfully!');
            data.forEach((item) => {
                if (item.answerId && item.s3Key) {
                    localStorage.setItem(item.answerId, item.s3Key);
                }
            });
            const ids = data.map((item) => item.answerId).join(',');
            router.push(`/speaking-result/${ids}`);
        },
    });
}

export function useEvaluateSpeaking() {
    return useMutation({
        mutationFn: async (payloads: GradingPayload[]) => {
            const promises = payloads.map(async (item) => {
                const { answerId, ...bodyPayload } = item;

                const url = `/v1/evaluations/speaking/evaluate/${answerId}`;

                const response = await fetchWrapper(url, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bodyPayload),
                });

                await throwIfError(response);

                return response.json() as Promise<SpeakingEvaluationResponse>;
            });

            return await Promise.all(promises);
        },
        onError: (error) => {
            console.error('Evaluation Error:', error);
            // toast.error(
            //     error instanceof Error
            //         ? error.message
            //         : 'Failed to evaluate speaking test',
            // );
        },
        onSuccess: (data) => {
            // toast.success('Evaluation completed successfully!');
            console.log('Evaluation Results:', data);
        },
    });
}
