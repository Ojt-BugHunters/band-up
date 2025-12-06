package com.project.Band_Up.dtos.studySession;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TopUserStudyTimeDto {
    private Integer rank;
    private UUID userId;
    private String name;
    private String avatar;
    private Long totalTime; // in seconds
}

