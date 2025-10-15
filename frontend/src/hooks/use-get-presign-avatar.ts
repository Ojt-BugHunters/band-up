'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchWrapper, throwIfError } from '@/lib/api';

export type AvatarPresign = {
    key: string;
    uploadUrl: string;
    cloudfrontUrl: string;
    expiresAt: string;
};

export interface PresignParams {
    fileName: string;
    contentType: 'image' | 'audio' | 'video' | string;
}

export function usePresignAvatar() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ fileName, contentType }: PresignParams) => {
            const qs = new URLSearchParams({
                fileName,
                contentType,
            }).toString();

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
            return response.json() as Promise<AvatarPresign>;
        },
        onSuccess: (data) => {
            toast.success('Presign URL created successfully');
            // Invalidate nếu cần cập nhật thông tin hồ sơ
            queryClient.invalidateQueries({ queryKey: ['profile.me'] });
            console.log('Presign response:', data);
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to presign avatar');
        },
    });

    return mutation;
}
