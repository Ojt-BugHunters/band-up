package com.project.Band_Up.services.media;

import com.project.Band_Up.dtos.media.*;
import com.project.Band_Up.entities.Media;
import com.project.Band_Up.entities.Question;
import com.project.Band_Up.entities.Section;
import com.project.Band_Up.repositories.MediaRepository;
import com.project.Band_Up.repositories.QuestionRepository;
import com.project.Band_Up.repositories.SectionRepository;
import com.project.Band_Up.services.AwsService.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

    private final S3Service s3Service;
    private final MediaRepository mediaRepository;
    private final SectionRepository sectionRepository;
    private final QuestionRepository questionRepository;

    @Value("${aws.cloudfront.ttl-seconds:86400}")
    private long cloudFrontTtlSeconds;

    // -------------------------------
    // Tạo presigned URL để FE upload lên S3
    // -------------------------------
    @Override
    public MediaResponse createPresignedUploadUrl(MediaRequest request) {
        log.info("[Media] Creating presigned S3 URL for entityType={}, entityId={}, fileName={}",
                request.getEntityType(), request.getEntityId(), request.getFileName());

        // 1. Xác định prefix theo loại entity
        String prefix = switch (request.getEntityType().toLowerCase()) {
            case "section" -> "sections";
            case "question" -> "questions";
            case "user" -> "users";
            case "blog" -> "blogs";
            case "dictation" -> "dictations";
            default -> "misc";
        };

        // 2. Nếu chưa có entityId (ví dụ đang tạo Section draft)
        String entityId = (request.getEntityId() == null || request.getEntityId().isBlank())
                ? "temp"
                : request.getEntityId();

        // 3. Sinh key duy nhất cho file
        String uniqueId = UUID.randomUUID().toString();
        String key = String.format("%s/%s/%s-%s", prefix, entityId, uniqueId, request.getFileName());

        // 4. Gọi AWS S3 để lấy presigned URL
        UploadInfo uploadInfo = s3Service.createUploadPresignedUrl(key, request.getContentType());

        log.info("[Media] Presigned URL generated successfully for key={}", key);

        return MediaResponse.builder()
                .key(uploadInfo.getKey())
                .uploadUrl(uploadInfo.getPresignedUrl()) // URL upload trực tiếp
                .expiresAt(uploadInfo.getExpiresAt())
                .build();
    }

    // -------------------------------
    // Lưu bản ghi Media vào database sau khi FE upload thành công
    // -------------------------------
    @Override
    public MediaResponse saveMediaRecord(MediaCreateRequest request) {
        log.info("[Media] Saving media record for key={} type={} entityId={}",
                request.getKey(), request.getType(), request.getEntityId());

        // 1. Tạo Media entity
        Media.MediaBuilder builder = Media.builder().s3Key(request.getKey());

        // 2. Gắn quan hệ Section hoặc Question
        if ("section".equalsIgnoreCase(request.getType())) {
            Section section = sectionRepository.findById(request.getEntityId())
                    .orElseThrow(() -> new RuntimeException("Section not found"));
            builder.section(section);
        } else if ("question".equalsIgnoreCase(request.getType())) {
            Question question = questionRepository.findById(request.getEntityId())
                    .orElseThrow(() -> new RuntimeException("Question not found"));
            builder.question(question);
        } else {
            throw new RuntimeException("Invalid media type: must be 'section' or 'question'");
        }

        Media saved = mediaRepository.save(builder.build());
        log.info("[Media] Media saved successfully with id={} key={}", saved.getId(), saved.getS3Key());

        // 3. Tạo URL CloudFront để FE xem lại ngay (có thể ký hoặc public)
        String signedUrl = s3Service.createCloudFrontSignedUrl(saved.getS3Key());
        Instant expiresAt = Instant.now().plusSeconds(cloudFrontTtlSeconds);

        return MediaResponse.builder()
                .key(saved.getS3Key())
                .cloudFrontUrl(signedUrl)
                .expiresAt(expiresAt)
                .build();
    }

    // -------------------------------
    // Lấy URL CloudFront Signed để FE hiển thị ảnh/video
    // -------------------------------
    @Override
    public MediaResponse createCloudFrontSignedUrl(String key) {
        log.info("[Media] Creating CloudFront signed URL for key={}", key);

        if (!s3Service.exists(key)) {
            throw new RuntimeException("File not found in S3 for key=" + key);
        }

        String signedUrl = s3Service.createCloudFrontSignedUrl(key);
        Instant expiresAt = Instant.now().plusSeconds(cloudFrontTtlSeconds);

        log.info("[Media] CloudFront signed URL generated successfully for key={}", key);

        return MediaResponse.builder()
                .key(key)
                .cloudFrontUrl(signedUrl)
                .expiresAt(expiresAt)
                .build();
    }
}
