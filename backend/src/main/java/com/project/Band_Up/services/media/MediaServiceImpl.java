package com.project.Band_Up.services.media;

import com.project.Band_Up.dtos.media.MediaRequest;
import com.project.Band_Up.dtos.media.MediaResponse;
import com.project.Band_Up.dtos.media.UploadInfo;
import com.project.Band_Up.services.AwsService.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

    private final S3Service s3Service;


    @Override
    public MediaResponse createPresignedUploadUrl(MediaRequest request) {
        log.info("[Media] Creating S3 upload key for entityType={}, entityId={}, fileName={}",
                request.getEntityType(), request.getEntityId(), request.getFileName());

        //1. Xác định prefix
        String prefix = switch (request.getEntityType().toLowerCase()) {
            case "section" -> "sections";
            case "question" -> "questions";
            case "user" -> "users";
            default -> "misc";
        };

        //2. EntityId có thể null (nếu chưa tạo xong)
        String entityId = (request.getEntityId() == null || request.getEntityId().isBlank())
                ? "temp"
                : request.getEntityId();

        //3. Sinh key duy nhất
        String uniqueId = UUID.randomUUID().toString();
        String key = String.format("%s/%s/%s-%s", prefix, entityId, uniqueId, request.getFileName());

        log.debug("[Media] Generated S3 key: {}", key);

        //4. Gọi S3Service để ký URL
        UploadInfo uploadInfo = s3Service.createUploadPresignedUrl(key, request.getContentType());

        //5. Trả về response
        log.info("[Media] Presigned URL generated successfully for {}", key);

        return MediaResponse.builder()
                .key(uploadInfo.getKey())
                .CloudFrontUrl(uploadInfo.getPresignedUrl())
                .expiresAt(uploadInfo.getExpiresAt())
                .build();
    }
}
