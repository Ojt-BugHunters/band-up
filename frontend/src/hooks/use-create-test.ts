import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const TestCreateSchema = z.object({
    skillName: z.string().min(1, 'Skill name is required'),
    title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title is too long'),
    durationMinutes: z.number(),
});

export const useCreateTest = () => {
    const form = useForm<z.infer<typeof TestCreateSchema>>({
        resolver: zodResolver(TestCreateSchema),
        defaultValues: {},
    });

    return {
        form,
    };
};
