import { fetchWrapper, throwIfError } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export const schema = z.object({
    password: z.string().min(1, 'Password is required'),
});

export const useJoinPrivateDeck = (deckId: string) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (password: string) => {
            const response = await fetchWrapper(`/quizlet/deck/${deckId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: password,
            });
            await throwIfError(response);
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: async () => {
            toast.success(`Join deck ${deckId} successfully`);
            await queryClient.invalidateQueries({ queryKey: ['flash-card'] });
            router.push(`/flashcard/${deckId}`);
        },
    });
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            password: '',
        },
    });

    return { form, mutation };
};
