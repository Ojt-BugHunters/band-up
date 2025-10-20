import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWrapper, throwIfError } from '@/lib/api';
import { toast } from 'sonner';

// single file schema
export const fileSchema = z.object({
    files: z
        .array(z.custom<File>())
        .max(1, 'Can be upload one file')
        .refine(
            (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
            {
                message: 'File size must be less than 5MB',
                path: ['files'],
            },
        )
        .optional(),
});

// A single section
export const sectionSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title must be less than 200 characters'),
    orderIndex: z.number().int().min(1).max(4),
    metadata: z.object({
        additionalProp1: z.string(),
        additionalProp2: z.string(),
        additionalProp3: z.string(),
    }),
});

// Full of section of the passage
export const sectionFormSchema = z.object({
    section: z
        .array(sectionSchema)
        .min(1, 'At least one section is required')
        .max(4, 'Maximum 4 section is allowed'),
});

export type CreateSingleSectionFormValues = z.infer<typeof sectionSchema>;
export type CreateFullSectionFormValues = z.infer<typeof sectionFormSchema>;

export const useCreatePassage = (testId: string) => {
    const mutation = useMutation({
        mutationFn: async (values: CreateSingleSectionFormValues) => {
            const response = await fetchWrapper(`/sections/test/${testId}`, {
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
            toast.success('Create new default section');
        },
    });

    const fullSectionForm = useForm<CreateFullSectionFormValues>({
        resolver: zodResolver(sectionFormSchema),
        defaultValues: {},
    });

    const singleSectionForm = useForm<CreateSingleSectionFormValues>({
        resolver: zodResolver(sectionSchema),
        defaultValues: {
            title: 'New Section',
            orderIndex: 1,
            metadata: {
                additionalProp1: 'string',
                additionalProp2: 'string',
                additionalProp3: 'string',
            },
        },
    });
    return {
        fullSectionForm,
        singleSectionForm,
        mutation,
    };
};
