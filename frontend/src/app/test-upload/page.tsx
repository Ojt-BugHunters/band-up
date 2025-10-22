'use client';
import S3FileUploader from '@/components/s3-file-uploader';
import { useSaveFile } from '@/hooks/use-save-file';

export default function Page() {
    const mutation = useSaveFile();

    const handleSave = async () => {
        const key = localStorage.getItem('uploadedKeys');
        if (!key) return;

        await mutation.mutateAsync({ key });
        localStorage.removeItem('uploadedKeys');
    };

    return (
        <div>
            <S3FileUploader
                presignEndpoint="/profile/avatar/presign"
                maxFiles={1}
                onUploaded={handleSave}
            />
        </div>
    );
}
