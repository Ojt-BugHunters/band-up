'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchWrapper, throwIfError } from '@/lib/api';
import { buildParams } from '@/lib/api';

export interface PresignParams {
    fileName: string;
    contentType: 'image' | 'audio';
}

export function usePresignAvatar() {
    const mutation = useMutation({
        mutationFn: async ({ fileName, contentType }: PresignParams) => {
            const qs = buildParams({ fileName, contentType }).toString();

            const response = await fetchWrapper(
                `/profile/avatar/presign?${qs}`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

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
