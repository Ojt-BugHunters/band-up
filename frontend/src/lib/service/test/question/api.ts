import { useQuery } from '@tanstack/react-query';
import { deserialize, fetchWrapper } from '../..';
import { TestSection } from '../section';
import {
    ListeningSectionsQuestion,
    PassageQuestion,
    ReadingQuestion,
    SpeakingQuestion,
    SpeakingSection,
    WritingQuestion,
    WritingSection,
} from './type';

export const useGetTestSections = (sectionIds: string[]) => {
    return useQuery({
        queryFn: async () => {
            const sections = await Promise.all(
                sectionIds.map(async (id) => {
                    const response = await fetchWrapper(`/sections/${id}`);
                    return await deserialize<TestSection>(response);
                }),
            );
            return sections;
        },
        queryKey: ['test-question', sectionIds],
        staleTime: 60 * 60 * 1000,
    });
};

export const useGetSectionsWithQuestions = (sectionIds: string[]) => {
    return useQuery({
        queryFn: async () => {
            const sectionsWithQuestions = await Promise.all(
                sectionIds.map(async (id) => {
                    const sectionResponse = await fetchWrapper(
                        `/sections/${id}`,
                    );
                    const section =
                        await deserialize<PassageQuestion>(sectionResponse);

                    const questionsResponse = await fetchWrapper(
                        `/sections/${id}/questions`,
                    );
                    const questions =
                        await deserialize<ReadingQuestion[]>(questionsResponse);

                    return {
                        ...section,
                        questions: questions,
                    };
                }),
            );

            return sectionsWithQuestions;
        },
        queryKey: ['reading-sections-with-questions', sectionIds],
        staleTime: 60 * 60 * 1000,
    });
};

export const useGetListeningWithQuestions = (sectionIds: string[]) => {
    return useQuery({
        queryFn: async () => {
            const sectionsWithQuestions = await Promise.all(
                sectionIds.map(async (id) => {
                    const sectionResponse = await fetchWrapper(
                        `/sections/${id}`,
                    );
                    const section =
                        await deserialize<PassageQuestion>(sectionResponse);

                    const questionsResponse = await fetchWrapper(
                        `/sections/${id}/questions`,
                    );
                    const questions =
                        await deserialize<ListeningSectionsQuestion[]>(
                            questionsResponse,
                        );

                    return {
                        ...section,
                        questions: questions,
                    };
                }),
            );

            return sectionsWithQuestions;
        },
        queryKey: ['listening-sections-with-questions', sectionIds],
        staleTime: 60 * 60 * 1000,
    });
};

export const useGetWritingWithQuestions = (sectionIds: string[]) => {
    return useQuery({
        queryFn: async () => {
            const sectionsWithQuestions = await Promise.all(
                sectionIds.map(async (id) => {
                    const sectionResponse = await fetchWrapper(
                        `/sections/${id}`,
                    );
                    const section =
                        await deserialize<WritingSection>(sectionResponse);
                    const questionsResponse = await fetchWrapper(
                        `/sections/${id}/questions`,
                    );
                    const questions =
                        await deserialize<WritingQuestion[]>(questionsResponse);
                    return {
                        ...section,
                        questions: questions,
                    };
                }),
            );
            return sectionsWithQuestions;
        },
        queryKey: ['writing-sections-with-questions', sectionIds],
        staleTime: 60 * 60 * 1000,
    });
};

export const useGetSpeakingWithQuestions = (sectionIds: string[]) => {
    return useQuery({
        queryFn: async () => {
            const sectionsWithQuestions = await Promise.all(
                sectionIds.map(async (id) => {
                    const sectionResponse = await fetchWrapper(
                        `/sections/${id}`,
                    );
                    const section =
                        await deserialize<SpeakingSection>(sectionResponse);
                    const questionsResponse = await fetchWrapper(
                        `/sections/${id}/questions`,
                    );
                    const questions =
                        await deserialize<SpeakingQuestion[]>(
                            questionsResponse,
                        );
                    return {
                        ...section,
                        questions: questions,
                    };
                }),
            );
            return sectionsWithQuestions;
        },
        queryKey: ['speaking-sections-with-questions', sectionIds],
        staleTime: 60 * 60 * 1000,
    });
};
