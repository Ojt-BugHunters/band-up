import { deserialize, fetchWrapper } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Tag } from './type';

export const useGetAllTags = () => {
    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper(`/blog/tags`);
            return await deserialize<Tag[]>(response);
        },
        queryKey: ['tags'],
    });
};
