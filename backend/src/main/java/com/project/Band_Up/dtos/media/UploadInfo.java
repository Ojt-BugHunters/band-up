package com.project.Band_Up.dtos.media;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class UploadInfo {
    private  String key;
    private  String presignedUrl;
    private  Instant expiresAt;
}
