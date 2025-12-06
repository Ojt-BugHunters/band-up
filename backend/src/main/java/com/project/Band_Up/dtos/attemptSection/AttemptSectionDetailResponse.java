package com.project.Band_Up.dtos.attemptSection;

import com.project.Band_Up.dtos.section.SectionDetailResponse;
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
public class AttemptSectionDetailResponse {
    private UUID attemptSectionId;
    private List<SectionDetailResponse> sections;
}
