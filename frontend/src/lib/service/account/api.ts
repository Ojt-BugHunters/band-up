'use client';

import { buildParams, deserialize, fetchWrapper } from '@/lib/service';
import { MediaResponse } from '../s3-upload';
import { AccountPage, AccountPageQuery, User } from './type';
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// get avatar of user
export const useGetAvatar = () => {
    return useQuery({
        queryKey: ['user-avatar'],
        queryFn: async () => {
            const res = await fetchWrapper('/profile/avatar');
            return await deserialize<MediaResponse>(res);
        },
        staleTime: Infinity, // do not automate reload, just call one time when user access to web or refresh
    });
};

// get info of user who is already login
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

export const useGetAccounts = (query: AccountPageQuery) => {
    const params = buildParams({
        page: query.page ?? 0,
        size: query.size ?? 20,
        sortBy: query.sortBy ?? 'createdAt',
        direction: query.direction ?? 'DESC',
    });

    return useQuery({
        queryKey: ['admin-accounts', params.toString()],
        queryFn: async () => {
            const response = await fetchWrapper(
                `/profile/accounts?${params.toString()}`,
            );
            return await deserialize<AccountPage>(response);
        },
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};
