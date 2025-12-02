package com.project.Band_Up.dtos.stats;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyStudyStatDto {
    private int year;
    private int month;
    private Integer totalMinutes;
    private List<Integer> dailyMinutes;
}

