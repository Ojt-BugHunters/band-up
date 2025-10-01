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

export const sectionSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title must be less than 200 characters'),
    orderIndex: z.number().int().min(1).max(4),
    metadata: z.object({
        content: z.string().max(7000, 'Content can be maximum 7000 characters'),
        image: fileSchema,
        audio: fileSchema,
    }),
});

export const sectionFormSchema = z.object({
    section: z
        .array(sectionSchema)
        .min(1, 'At least one section is required')
        .max(4, 'Maximum 4 section is allowed'),
});

export const useCreatePassage = () => {
    const sectionForm = useForm<z.infer<typeof sectionFormSchema>>({
        resolver: zodResolver(sectionFormSchema),
        defaultValues: {},
    });
    return {
        sectionForm,
    };
};
