import {
    buildParams,
    deserialize,
    fetchWrapper,
    Pagination,
    throwIfError,
} from '@/lib/api';
import {
    baseSchema,
    CreateDeckFormValues,
    Deck,
    deckPasswordSchema,
    FlashCardData,
    PaginationInfo,
} from './type';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const useGetFlashcardStats = () => {
    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper(`/quizlet/stats`);
            return await deserialize<FlashCardData>(response);
        },
        queryKey: ['quizlet', 'stats'],
    });
};

export const useGetDeck = (paginationInfo: PaginationInfo) => {
    const params = buildParams(paginationInfo as Record<string, unknown>);

    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper(
                `/quizlet/deck?${params.toString()}`,
            );
            return await deserialize<Pagination<Deck>>(response);
        },
        placeholderData: (prev) => prev,
        staleTime: 10_000,
        refetchOnWindowFocus: false,
        queryKey: ['flash-card', paginationInfo],
    });
};

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
            queryClient.setQueryData(['deck'], data);
            localStorage.setItem(`deck:${deckId}`, JSON.stringify(data));
            router.push(`/flashcard/${deckId}`);
        },
    });
    const form = useForm<z.infer<typeof deckPasswordSchema>>({
        resolver: zodResolver(deckPasswordSchema),
        defaultValues: {
            password: '',
        },
    });

    return { form, mutation };
};

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

export function useCreateDeck() {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof baseSchema>) => {
            const response = await fetchWrapper('/quizlet/deck/create', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: () => {
            toast.success('Create successfully');
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

    return {
        form,
        mutation,
    };
}

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
