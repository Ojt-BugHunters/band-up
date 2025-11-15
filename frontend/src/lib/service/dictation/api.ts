import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    CreateDictationQuestionReq,
    CreateFullSectionFormInput,
    createPassageParams,
    CreateQuestionRes,
    Dictation,
    DictationQuestion,
    DictationQuestionFormData,
    dictationQuestionSchema,
    DictationSection,
    DictationSectionQuestion,
    MappedQuestion,
    sectionFormSchema,
    TestCreateFormValues,
    TestCreateSchema,
} from './type';
import { deserialize, fetchWrapper, throwIfError } from '@/lib/service';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import z from 'zod';
import { putFileToS3WithProgress } from '../s3-upload';

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

// in each test we have: 1 test - N sections - N questions
// create section
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

// create question
// logic: loops sections --> in each sections --> loop questions
// for each question, call api to create --> get upload url --> upload to s3 --> receive key --> call api to save
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

                    const mediaRes = await fetchWrapper('/media', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            entityId: resDto.id,
                            key: resDto.key,
                            type: 'question',
                        }),
                    });
                    await throwIfError(mediaRes);
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

// create test
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

// get dictation tests
export const useGetDictationTests = () => {
    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper(`/tests`);
            return await deserialize<Dictation[]>(response);
        },
        queryKey: ['dictation-tests'],
        staleTime: 60 * 60 * 1000,
    });
};

// get dictation specific test
export const useGetDictationTest = (testId: string) => {
    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper(`/tests/${testId}`);
            return await deserialize<Dictation>(response);
        },
        queryKey: ['dictation-test'],
        staleTime: 60 * 60 * 1000, // 60 mins
    });
};

// get questions of each test
export const useGetDictationQuestion = (questionId: string) => {
    return useQuery({
        queryKey: ['dictation-question'],
        queryFn: async () => {
            const response = await fetchWrapper(`/questions/${questionId}`);
            return await deserialize<DictationQuestion>(response);
        },
        staleTime: 60 * 60 * 1000, // 60 mins
    });
};

// get all questions of each section + order by orderIndex
export const useGetSectionQuestions = (testId: string) => {
    return useQuery({
        queryKey: ['dictation-section-question'],
        queryFn: async () => {
            const sectionApiRes = await fetchWrapper(
                `/sections/test/${testId}`,
            );
            const sections =
                await deserialize<DictationSection[]>(sectionApiRes);
            const orderedSections = (sections ?? []).sort(
                (a, b) => a.orderIndex - b.orderIndex,
            );
            if (!orderedSections.length) return [];

            const questionLists = await Promise.all(
                orderedSections.map(async (section: DictationSection) => {
                    const questionRes = await fetchWrapper(
                        `/sections/${section.id}/questions`,
                    );
                    const questions =
                        await deserialize<DictationQuestion[]>(questionRes);
                    return questions ?? [];
                }),
            );

            const combineSectionsQuestions: DictationSectionQuestion[] =
                orderedSections.map(
                    (section: DictationSection, index: number) => ({
                        ...section,
                        questions: questionLists[index] ?? [],
                    }),
                );
            return combineSectionsQuestions;
        },
    });
};

// increase of user do test
export const useDoDictation = (testId: string) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async () => {
            const response = await fetchWrapper(
                `/tests/${testId}/increase-view`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );
            await throwIfError(response);
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['dictation'],
            });
        },
    });
    return mutation;
};
