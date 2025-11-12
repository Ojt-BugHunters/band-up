'use client';

import { fetchWrapper, throwIfError } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MediaRequest, SaveFileVars } from './type';

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

export function usePresignUpload(endpoint: string = 'media/presign') {
    const mutation = useMutation({
        mutationFn: async (body: MediaRequest) => {
            const response = await fetchWrapper(endpoint, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            await throwIfError(response);
            return response.json();
        },
        onSuccess: (data) => {
            localStorage.setItem('uploadedKeys', data.key);
            toast.success('Presign URL created successfully');
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to presign avatar');
        },
    });

    return mutation;
}
