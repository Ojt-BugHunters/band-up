'use client';

import { deserialize, fetchWrapper } from '@/lib/api';
import { MediaResponse } from '../s3-upload';
import { User } from './type';
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetAvatar = () => {
    return useQuery({
        queryKey: ['user-avatar'],
        queryFn: async () => {
            const res = await fetchWrapper('/profile/avatar');
            return await deserialize<MediaResponse>(res);
        },
    });
};

export function useUser() {
    const queryClient = useQueryClient();

    const { data: user } = useQuery<User | null>({
        queryKey: ['user'],
        queryFn: async () => {
            return queryClient.getQueryData<User>(['user']) ?? null;
        },
        staleTime: Infinity,
        initialData: () => {
            return queryClient.getQueryData<User>(['user']) ?? null;
        },
    });

    useEffect(() => {
        if (!user && typeof window !== 'undefined') {
            const stored = localStorage.getItem('user');
            if (stored) {
                const parsed: User = JSON.parse(stored);
                queryClient.setQueryData(['user'], parsed);
            }
        }
    }, [user, queryClient]);

    return user;
}
