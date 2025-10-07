import { useMutation } from '@tanstack/react-query';
import { fetchWrapper, throwIfError } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useDeleteDeck() {
  const router = useRouter();

  const deleteMutation = useMutation({
    mutationFn: async (deckId: string) => {
      const response = await fetchWrapper(`/quizlet/deck/${deckId}/delete`, {
        method: 'DELETE',
      });
      await throwIfError(response);
      return response.json();
    },
    onSuccess: () => {
      toast.success('Deleted successfully!');
      router.push('/flashcard');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return deleteMutation;
}