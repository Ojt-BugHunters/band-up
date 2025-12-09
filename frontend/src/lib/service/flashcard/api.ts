import {
    buildParams,
    deserialize,
    fetchWrapper,
    Pagination,
    throwIfError,
} from '@/lib/service';
import {
    baseSchema,
    CompletionRatePoint,
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
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { StatsInterval } from '@/lib/service/stats';

// get stats of flash card
export const useGetFlashcardStats = (
    statsInterval: StatsInterval = 'WEEKLY',
) => {
    return useQuery({
        queryFn: async () => {
            const params = new URLSearchParams({ statsInterval });
            const response = await fetchWrapper(
                `/quizlet/stats?${params.toString()}`,
            );
            return await deserialize<FlashCardData>(response);
        },
        queryKey: ['quizlet', 'stats', statsInterval],
    });
};

export const useGetFlashcardCompletionRate = (year: number) => {
    return useQuery({
        queryFn: async () => {
            const params = new URLSearchParams({ year: String(year) });
            const response = await fetchWrapper(
                `/quizlet/stats/completion-rate?${params.toString()}`,
            );
            return await deserialize<CompletionRatePoint[]>(response);
        },
        queryKey: ['quizlet', 'completion-rate', year],
        enabled: Boolean(year),
    });
};

// get decks + pagination + fuzzy search by pagination
export const useGetDecks = (paginationInfo: PaginationInfo) => {
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

// update card in specific deck
export const useUpdateDeckCard = (deckId: string) => {
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

// create deck + card in deck
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

// delete deck
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

// user join the private deck have to input password
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

// increase the learned number of deck
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
