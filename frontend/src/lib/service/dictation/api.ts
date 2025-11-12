import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    CreateDictationQuestionReq,
    CreateFullSectionFormInput,
    CreateFullSectionPayload,
    CreateQuestionRes,
    Dictation,
    DictationQuestionFormData,
    dictationQuestionSchema,
    DictationSection,
    MappedQuestion,
    sectionFormSchema,
    TestCreateFormValues,
    TestCreateSchema,
} from './type';
import { deserialize, fetchWrapper, throwIfError } from '@/lib/api';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import z from 'zod';
import { putFileToS3WithProgress } from '../s3-upload';

export interface createPassageParams {
    payload: CreateFullSectionPayload;
    testId: string;
}

export const useCreatePassage = () => {
    const mutation = useMutation({
        mutationFn: async ({ payload, testId }: createPassageParams) => {
            const response = await fetchWrapper(
                `/sections/test/${testId}/bulk`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload.section),
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
                        contentType: q.file.type,
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

export const useCreateTest = () => {
    const mutation = useMutation({
        mutationFn: async (values: TestCreateFormValues) => {
            const response = await fetchWrapper('/tests', {
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
            localStorage.setItem('create-test-id', data.id);
            toast.success('Create test successfully');
        },
    });
    const createTestForm = useForm<z.infer<typeof TestCreateSchema>>({
        resolver: zodResolver(TestCreateSchema),
        defaultValues: {
            skillName: 'Dictation',
            title: '',
        },
    });

    return {
        createTestForm,
        mutation,
    };
};

export const useGetDictationTests = () => {
    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper(`/tests`);
            return await deserialize<Dictation[]>(response);
        },
        queryKey: ['dictation-tests'],
    });
};
