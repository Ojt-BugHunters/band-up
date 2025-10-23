import S3FileUploader from '@/components/s3-file-uploader';
import { useMemo } from 'react';

export default function TestUpload() {
    const entityId = useMemo(() => crypto.randomUUID(), []);
    return (
        <div>
            <S3FileUploader
                presignEndpoint="/media/presign"
                accept="image/*"
                entityType="Blog"
                entityId={entityId}
                maxFiles={1}
                multiple={false}
            />
        </div>
    );
}
