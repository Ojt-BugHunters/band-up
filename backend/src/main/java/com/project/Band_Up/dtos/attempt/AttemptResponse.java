package com.project.Band_Up.dtos.attempt;

import lombok.*;
import java.time.LocalDateTime;
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
}
