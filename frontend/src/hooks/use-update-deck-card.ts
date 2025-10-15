import { fetchWrapper, throwIfError } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CreateDeckFormValues, baseSchema } from './use-create-deck-card';
export const useUpdateDeck = (deckId: string) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (values: CreateDeckFormValues) => {
            const response = await fetchWrapper(
                `/quizlet/deck/${deckId}/update`,
                {
                    method: 'PUT',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                },
            );
            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: () => {
            toast.success('Update card successfully');
            queryClient.invalidateQueries({ queryKey: ['flash-card'] });
            router.push('/flashcard');
        },
    });

    const form = useForm<CreateDeckFormValues>({
        resolver: zodResolver(baseSchema),
        defaultValues: {
            title: '',
            description: '',
            public: true,
            password: '',
            cards: [
                {
                    front: '',
                    back: '',
                },
            ],
        },
    });

    return { form, mutation };
};
