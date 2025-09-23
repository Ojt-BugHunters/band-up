import { useQuery } from '@tanstack/react-query';
import { User } from '@/lib/api/dto/account';

export function useUser() {
    return useQuery<User | null>({
        queryKey: ['user'],
        queryFn: async () => null,
        staleTime: Infinity,
        enabled: false,
    }).data;
}
