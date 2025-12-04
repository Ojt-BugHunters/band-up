import { useQuery } from '@tanstack/react-query';
import { deserialize, fetchWrapper } from '../..';
import { TestSection } from './type';

export const useGetTestSections = (testId: string) => {
    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper(`/sections/test/${testId}`);
            return await deserialize<TestSection[]>(response);
        },
        queryKey: ['test-section'],
        refetchOnWindowFocus: true,
    });
};
