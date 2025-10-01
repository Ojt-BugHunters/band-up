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

export const passageSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title must be less than 200 characters'),
    orderIndex: z.number().int().min(1).max(3),
    metadata: z.object({
        content: z
            .string()
            .min(5, 'Content must be at least 5 characters')
            .max(7000, 'Content can be maximum 7000 characters'),
        image: fileSchema,
    }),
});

export const passageFormSchema = z.object({
    passages: z
        .array(passageSchema)
        .min(1, 'At least one passage is required')
        .max(4, 'Maximun 4 passages is allowed'),
});

export const useCreatePassage = () => {
    const passagesForm = useForm<z.infer<typeof passageFormSchema>>({
        resolver: zodResolver(passageFormSchema),
        defaultValues: {},
    });

    return {
        passagesForm,
    };
};
