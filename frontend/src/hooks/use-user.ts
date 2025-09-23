import { useQueryClient } from '@tanstack/react-query';
import { User } from '@/lib/api/dto/account';

export function useUser() {
    const queryClient = useQueryClient();
    const user = queryClient.getQueryData(['user']);
    return user as User;
}
