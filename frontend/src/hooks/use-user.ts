import { useQueryClient } from '@tanstack/react-query';

export function useUser() {
    const queryClient = useQueryClient();
    const user = queryClient.getQueryData(['user']);
    return user;
}
