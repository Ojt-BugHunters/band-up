import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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

export const useCreatePassage = () => {
    const fullSectionForm = useForm<CreateFullSectionFormInput>({
        resolver: zodResolver(sectionFormSchema),
        defaultValues: { section: [{ title: '' }] },
    });

    return { fullSectionForm };
};
