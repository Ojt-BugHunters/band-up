package com.project.Band_Up.dtos.attemptSection;

import com.project.Band_Up.dtos.aiWriting.AiEvaluationDetailResponse;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptSectionAiEvaluationResponse {

    private UUID attemptSectionId;
    private UUID sectionId;
    private String sectionTitle;
    private List<AiEvaluationDetailResponse> aiEvaluations;
}