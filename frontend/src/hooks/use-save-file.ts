'use client';

import { fetchWrapper, throwIfError } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SaveFileVars {
    key: string;
}

export function useSaveFile() {
    const mutation = useMutation({
        mutationFn: async ({ key }: SaveFileVars) => {
            const url = `/profile/avatar/save?key=${encodeURIComponent(key)}`;
            const response = await fetchWrapper(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            await throwIfError(response);
            return response.json();
        },
        onSuccess: () => {
            toast.success('File key save successfully');
        },
        onError: () => {
            toast.error('Fail to save file key');
        },
    });
    return mutation;
}
