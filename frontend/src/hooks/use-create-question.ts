import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

export const dictationQuestionSchema = z.object({
    questions: z
        .array(
            z.object({
                sectionIndex: z.number(),
                difficult: z.number(),
                type: z.string(),
                file: z
                    .instanceof(File, { message: 'Audio file is required' })
                    .refine((f) => f.size <= 5 * 1024 * 1024, 'Max 5MB'),
                script: z.string().min(1, 'Script is required'),
            }),
        )
        .min(1, 'At least one question is required'),
});

export type DictationQuestionFormData = z.infer<typeof dictationQuestionSchema>;

export const useCreateQuestion = () => {
    const dictationQuestionForm = useForm<DictationQuestionFormData>({
        resolver: zodResolver(dictationQuestionSchema),
        defaultValues: {
            questions: [],
        },
    });

    const questionFA = useFieldArray({
        control: dictationQuestionForm.control,
        name: 'questions',
    });

    return {
        dictationQuestionForm,
        questionFA,
    };
};
