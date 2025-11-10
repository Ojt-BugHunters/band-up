package com.project.Band_Up.dtos.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class AvtName {
    private String name;
    private String cloudFrontUrl;
    private Instant expiresAt;
}
