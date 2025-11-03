import { fetchWrapper, putFileToS3WithProgress, throwIfError } from '@/lib/api';
import {
    MappedQuestion,
    CreateQuestionRes,
    CreateDictationQuestionReq,
} from '@/lib/api/dto/question';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
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

function mapDifficulty(level: number): string {
    switch (level) {
        case 1:
            return 'easy';
        case 2:
            return 'medium';
        case 3:
            return 'hard';
        default:
            return 'unknown';
    }
}

function groupBySectionId(items: MappedQuestion[]) {
    const grouped: Record<string, MappedQuestion[]> = {};
    for (const q of items) {
        if (!grouped[q.sectionId]) grouped[q.sectionId] = [];
        grouped[q.sectionId].push(q);
    }
    return grouped;
}

export type DictationQuestionFormData = z.infer<typeof dictationQuestionSchema>;

export const useCreateQuestion = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (questions: MappedQuestion[]) => {
            if (!questions?.length) return [];
            const grouped = groupBySectionId(questions);
            const created: CreateQuestionRes[] = [];

            for (const [sectionId, qs] of Object.entries(grouped)) {
                for (const q of qs) {
                    const body: CreateDictationQuestionReq = {
                        difficult: mapDifficulty(q.difficult),
                        type: q.type,
                        fileName: q.file.name,
                        script: q.script,
                    };

                    const response = await fetchWrapper(
                        `/sections/${sectionId}/questions/bulk`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify([body]),
                        },
                    );
                    await throwIfError(response);
                    const jsonRes = await response.json();
                    const resDto: CreateQuestionRes = Array.isArray(jsonRes)
                        ? jsonRes[0]
                        : jsonRes;

                    if (!resDto?.uploadUrl) {
                        toast.error('Missing uploadUrl');
                    }
                    await putFileToS3WithProgress({
                        url: resDto.uploadUrl,
                        file: q.file,
                        contentType: q.file.type || 'application/octet-stream',
                        expectedStatuses: [200, 201, 204],
                    });
                    created.push(resDto);
                }
            }
            return created;
        },
        onSuccess: () => {
            toast.success('Create question successfully');
            queryClient.invalidateQueries({ queryKey: ['questions'] });
        },
        onError: () => {
            toast.error('Fail in created Questions');
        },
    });

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
        mutation,
    };
};
