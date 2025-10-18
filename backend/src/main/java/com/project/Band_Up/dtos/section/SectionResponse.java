package com.project.Band_Up.dtos.section;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.util.Map;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SectionResponse {
    private UUID id;
    private UUID testId;
    private String title;
    private Integer orderIndex;
    private BigInteger timeLimitSeconds;
    private Map<String, Object> metadata;
}
