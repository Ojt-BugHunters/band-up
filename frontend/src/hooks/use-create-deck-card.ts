import { fetchWrapper, throwIfError } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export const baseSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    cards: z
        .array(
            z.object({
                front: z.string().min(1, 'Front side is required'),
                back: z.string().min(1, 'Back side is required'),
            }),
        )
        .min(1, 'At least one card is required'),
    public: z.boolean(),
    password: z.string().optional(),
});

export type CreateDeckFormValues = z.infer<typeof baseSchema>;

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
