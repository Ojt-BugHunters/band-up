'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '@/lib/api/dto/account';

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
