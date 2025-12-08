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
    SubmitAnswerParams,
} from './type';

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
            toast.error(error?.message ?? 'Join Test Fail');
        },
        onSuccess: () => {
            toast.success('Join Test Successfully');
        },
    });
}

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
            toast.error(error?.message ?? 'Fail to save attempt');
        },
        onSuccess: () => {
            toast.success('Save attempt successfully. Try your best!');
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
            toast.error(error?.message ?? 'Fail to submit answers');
        },
        onSuccess: (data) => {
            toast.success(
                'Test submitted successfully! Your score: ' + data.bandScore,
            );
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
