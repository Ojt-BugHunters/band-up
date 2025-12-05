import { useMutation } from '@tanstack/react-query';
import { fetchWrapper, throwIfError } from '..';
import { toast } from 'sonner';

export function useCreateAttempt() {
    return useMutation({
        mutationFn: async (testId: string) => {
            const response = await fetchWrapper(`/attempts/${testId}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
            });

            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error?.message ?? 'Join Test Fail');
        },
        onSuccess: () => {
            toast.success('Join Test Successfully');
        },
    });
}
