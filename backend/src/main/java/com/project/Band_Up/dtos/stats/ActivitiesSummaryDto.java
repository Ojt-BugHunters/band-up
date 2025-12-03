package com.project.Band_Up.dtos.stats;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivitiesSummaryDto {
    private Integer totalSessions;
    private Integer focusedTime;
    private Integer bestSession;
    private Integer taskCompleted;
}
