import { useMutation } from '@tanstack/react-query';
import { fetchWrapper, throwIfError } from '..';
import { toast } from 'sonner';
import {
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
