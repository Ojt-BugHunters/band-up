'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchWrapper, throwIfError } from '@/lib/api';
import { MediaRequest } from '@/lib/api/dto/media';

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
            toast.success('Presign URL created successfully');
            console.log('Presign response:', data);
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to presign avatar');
        },
    });

    return mutation;
}
