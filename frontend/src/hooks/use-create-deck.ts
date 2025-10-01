import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWrapper, throwIfError } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';




export const createDeckSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),
})

export type CreateDeckFormValues = z.infer<typeof createDeckSchema>

export function useCreateDeck() {
    const queryClient = useQueryClient();
    const router = useRouter();

  const form = useForm<CreateDeckFormValues>({
    resolver: zodResolver(createDeckSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

      const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof createDeckSchema>) => {
            const response = await fetchWrapper('/api/quizlet/deck/create', {
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
        onSuccess: (data) => {
            queryClient.setQueryData(['user'], data);
            localStorage.setItem('user', JSON.stringify(data));
            toast.success('Create successfully');
            router.push('/');
        },
    });

  return {
    form,
    mutation,
  }
}
