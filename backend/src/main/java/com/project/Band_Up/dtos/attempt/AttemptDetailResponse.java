package com.project.Band_Up.dtos.attempt;

import com.project.Band_Up.dtos.attemptSection.AttemptSectionDetailResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptDetailResponse {
    private UUID attemptId;
    private UUID testId;
    private String testTitle;
    private String testSkillName;
    private List<AttemptSectionDetailResponse> attemptSections;
}
