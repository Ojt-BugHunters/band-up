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
    const router = useRouter();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (password: string) => {
            const response = await fetchWrapper(`/quizlet/deck/${deckId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: password ? password : JSON.stringify(''),
            });
            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: async (data) => {
            toast.success(`Join deck ${deckId} successfully`);
            queryClient.setQueryData(['deck'], data);
            localStorage.setItem(`deck:${deckId}`, JSON.stringify(data));
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
