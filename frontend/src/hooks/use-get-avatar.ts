'use client';

import { deserialize, fetchWrapper } from '@/lib/api';
import { MediaResponse } from '@/lib/api/dto/media';
import { useQuery } from '@tanstack/react-query';

export const useGetAvatar = () => {
    return useQuery({
        queryKey: ['user-avatar'],
        queryFn: async () => {
            const res = await fetchWrapper('/profile/avatar');
            return await deserialize<MediaResponse>(res);
        },
    });
};
