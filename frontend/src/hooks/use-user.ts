import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '@/lib/api/dto/account';

export function useUser() {
    const queryClient = useQueryClient();
    return useQuery<User | null>({
        queryKey: ['user'],
        queryFn: async () => {
            let user = queryClient.getQueryData<User>(['user']);
            if (!user) {
                const stored = localStorage.getItem('user');
                if (stored) {
                    user = JSON.parse(stored);
                    queryClient.setQueryData(['user'], user);
                }
            }
            return user ?? null;
        },
        staleTime: Infinity,
        initialData: () => {
            return (
                queryClient.getQueryData<User>(['user']) ??
                (localStorage.getItem('user')
                    ? JSON.parse(localStorage.getItem('user')!)
                    : null)
            );
        },
    }).data;
}
