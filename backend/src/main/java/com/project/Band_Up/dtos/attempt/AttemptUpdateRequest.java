package com.project.Band_Up.dtos.attempt;

import lombok.*;

import java.time.LocalDateTime;
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptUpdateRequest {
    private LocalDateTime submitAt;
    private String status; // e.g., "IN_PROGRESS", "COMPLETED"
    private Integer score; // e.g., percentage score
    private Double overallBand;
}
