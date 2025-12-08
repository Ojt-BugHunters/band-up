package com.project.Band_Up.dtos.aiWriting;

import com.project.Band_Up.enums.EvalType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiEvaluationDetailResponse {

    private UUID aiEvaluationId;
    private UUID answerId;
    private UUID attemptSectionId;
    private String answerContent;
    private EvalType evalType;
    private Object  aiResponse;
    private Double overallBand;
    private LocalDateTime createdAt;
}