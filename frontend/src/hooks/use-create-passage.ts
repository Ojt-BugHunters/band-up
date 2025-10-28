import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { fetchWrapper, throwIfError } from '@/lib/api';
import { toast } from 'sonner';
import { DictationSection } from '@/lib/api/dto/dictation';

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

const sectionInputSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Max 200 chars'),
});

export const sectionFormSchema = z
    .object({
        section: z
            .array(sectionInputSchema)
            .min(1, 'At least one section')
            .max(4, 'Max 4 sections'),
    })
    .transform(({ section }) => ({
        section: section.map((s, i) => ({ title: s.title, orderIndex: i + 1 })),
    }));

export type CreateFullSectionFormInput = z.input<typeof sectionFormSchema>;
export type CreateFullSectionPayload = z.output<typeof sectionFormSchema>;

export const useCreatePassage = (testId: string) => {
    const mutation = useMutation({
        mutationFn: async (values: CreateFullSectionPayload) => {
            const response = await fetchWrapper(
                `/sections/test/${testId}/bulk`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values.section),
                },
            );
            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (data) => {
            toast.success('Create section successfully');
            data.forEach((item: DictationSection, index: number) => {
                const key = `section-${index + 1}`;
                localStorage.setItem(key, item.id);
            });
        },
    });
    const fullSectionForm = useForm<CreateFullSectionFormInput>({
        resolver: zodResolver(sectionFormSchema),
        defaultValues: { section: [{ title: '' }] },
    });

    return { fullSectionForm, mutation };
};
