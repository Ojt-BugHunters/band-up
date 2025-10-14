'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { fetchWrapper, throwIfError } from '@/lib/api';
import { AvatarPresign } from '@/lib/api/dto/account';

// ===== Schema & types =====
export const avatarSchema = z.object({
    entityId: z.string().min(1, 'Thiếu entityId'), // nếu BE không cần thì bỏ
    file: z
        .custom<File>((v) => v instanceof File, { message: 'Chưa chọn ảnh' })
        .refine((f) => /^image\//.test(f.type), 'Chỉ nhận ảnh (png/jpeg/webp)')
        .refine((f) => f.size <= 5 * 1024 * 1024, 'Tối đa 5MB'),
});
export type AvatarFormValues = z.infer<typeof avatarSchema>;

type UploadResult = {
    key: string;
    cloudfrontUrl: string;
    expiresAt: string;
};

export async function presignAvatar(params: {
    fileName: string;
    contentType: string;
}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchWrapper(`/profile/avatar/presign?${qs}`, {
        method: 'POST',
    });
    await throwIfError(res);
    return res.json() as Promise<AvatarPresign>;
}

// ===== Helper: PUT S3 with progress =====
function putFileToS3WithProgress(opts: {
    url: string;
    file: File;
    onProgress?: (pct: number) => void;
    signal?: AbortSignal;
}): Promise<void> {
    const { url, file, onProgress, signal } = opts;

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable && onProgress) {
                onProgress(Math.round((evt.loaded / evt.total) * 100));
            }
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else
                reject(
                    new Error(
                        `S3 upload failed: ${xhr.status} ${xhr.statusText}`,
                    ),
                );
        };
        xhr.onerror = () =>
            reject(new Error('Network error while uploading to S3'));
        xhr.onabort = () => reject(new Error('Upload aborted'));

        xhr.open('PUT', url);
        xhr.setRequestHeader(
            'Content-Type',
            file.type || 'application/octet-stream',
        );
        xhr.send(file);

        if (signal) {
            signal.addEventListener('abort', () => {
                try {
                    xhr.abort();
                } catch {}
            });
        }
    });
}

// ===== Hook chính =====
export const useUploadAvatar = (opts?: {
    onProgress?: (pct: number) => void;
    onSuccess?: (res: UploadResult) => void;
}) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (values: AvatarFormValues): Promise<UploadResult> => {
            const { file } = avatarSchema.parse(values);

            // 1) Presign từ BE (swagger bạn gửi: POST /api/profile/avatar/presign?fileName&contentType)
            const presign = await presignAvatar({
                fileName: file.name,
                contentType: file.type || 'application/octet-stream',
            }); // { key, uploadUrl, cloudfrontUrl, expiresAt }

            // 2) Upload trực tiếp lên S3 (progress)
            const controller = new AbortController();
            await putFileToS3WithProgress({
                url: presign.uploadUrl,
                file,
                onProgress: opts?.onProgress,
                signal: controller.signal,
            });

            // 3) (tuỳ) confirm về BE nếu bạn có endpoint confirm avatar
            // await fetchWrapper('/profile/avatar/confirm', { ... })

            return {
                key: presign.key,
                cloudfrontUrl: presign.cloudfrontUrl,
                expiresAt: presign.expiresAt,
            };
        },
        onError: (err: any) => {
            const message = err?.message ?? 'Upload thất bại';
            toast.error(message);
        },
        onSuccess: (data) => {
            // Nếu avatar hiển thị ở hồ sơ, có thể invalidate query hồ sơ
            queryClient
                .invalidateQueries({ queryKey: ['profile.me'] })
                .catch(() => {});
            opts?.onSuccess?.(data);
            toast.success('Upload avatar thành công');
        },
    });

    const form = useForm<AvatarFormValues>({
        resolver: zodResolver(avatarSchema),
        defaultValues: {
            entityId: '', // nếu không dùng có thể bỏ khỏi schema
            file: undefined as unknown as File,
        },
    });

    return { form, mutation };
};
