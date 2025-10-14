import { fetchWrapper, throwIfError } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useDeleteDeck() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async (deckId: string) => {
            const response = await fetchWrapper(
                `/quizlet/deck/${deckId}/delete`,
                {
                    method: 'DELETE',
                },
            );
            await throwIfError(response);
            return response.json();
        },
        onSuccess: () => {
            toast.success('Deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['flash-card'] });
            router.push('/flashcard');
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    return deleteMutation;
}

