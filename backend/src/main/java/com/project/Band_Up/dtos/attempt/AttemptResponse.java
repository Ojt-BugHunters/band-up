package com.project.Band_Up.dtos.attempt;

import com.project.Band_Up.dtos.attemptSection.AttemptSectionResponse;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptResponse {
    private UUID id;
    private UUID userId;
    private UUID testId;
    private LocalDateTime startAt;
    private LocalDateTime submitAt;
    private String status;
    private Integer score;
    private Double overallBand;
    private List<AttemptSectionResponse> attemptSections;
}
