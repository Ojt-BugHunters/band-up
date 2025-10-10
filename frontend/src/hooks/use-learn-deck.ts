import { fetchWrapper, throwIfError } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useLearnDeck = (deckId: string) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async () => {
            const response = await fetchWrapper(
                `/quizlet/deck/${deckId}/add-learner`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );
            await throwIfError(response);
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['flash-card', 'quizlet'],
            });
        },
    });
    return mutation;
};
