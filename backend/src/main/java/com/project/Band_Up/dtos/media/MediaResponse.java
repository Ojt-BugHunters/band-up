package com.project.Band_Up.dtos.media;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MediaResponse {
    private String key;            // key trong S3 (users/{id}/avatar-{uuid}.png)
    private String uploadUrl;      // presigned URL để FE upload lên S3
    private String cloudFrontUrl;  // URL CloudFront để FE hiển thị ảnh
    private Instant expiresAt;
}
