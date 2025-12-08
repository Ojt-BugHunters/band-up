package com.project.Band_Up.dtos.attempt;

import com.project.Band_Up.dtos.aiWriting.AiEvaluationDetailResponse;
import com.project.Band_Up.dtos.attemptSection.AttemptSectionAiEvaluationResponse;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptAiEvaluationsResponse {

    private UUID attemptId;
    private UUID testId;
    private String testTitle;
    private String testSkillName;
    private Integer totalScore;
    private Double overallBand;
    private List<AttemptSectionAiEvaluationResponse> attemptSections;
}