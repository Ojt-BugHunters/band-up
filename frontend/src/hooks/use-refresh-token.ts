import { fetchWrapper, throwIfError } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export const useRefreshToken = () => {
    return useQuery({
        queryKey: ['refresh-token'],
        queryFn: async () => {
            const response = await fetchWrapper('/auth/refresh', {
                method: 'POST',
            });
            await throwIfError(response);
            return response;
        },
        refetchInterval: 10 * 1000 * 60,
        refetchIntervalInBackground: true,
        retry: false,
    });
};
