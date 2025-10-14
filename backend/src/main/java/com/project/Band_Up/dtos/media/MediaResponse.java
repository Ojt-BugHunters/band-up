package com.project.Band_Up.dtos.media;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MediaResponse {
    private String key;
    private String cloudFrontUrl;
    private Instant expiresAt;
}
