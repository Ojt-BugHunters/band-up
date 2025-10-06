import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { fetchWrapper, throwIfError } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const baseSchema = z.object({
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

export const createDeckSchema = baseSchema.superRefine((values, ctx) => {
    if (!values.public) {
        const password = values.password?.trim();
        if (!password || password.length < 4) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Password must be at least 4 characters for private decks',
                path: ['password'],
            });
        }
    }
});

export type CreateDeckFormValues = z.infer<typeof createDeckSchema>;

export function useCreateDeck() {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof createDeckSchema>) => {
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
            router.push('/');
        },
    });

    const form = useForm<CreateDeckFormValues>({
        resolver: zodResolver(createDeckSchema),
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
