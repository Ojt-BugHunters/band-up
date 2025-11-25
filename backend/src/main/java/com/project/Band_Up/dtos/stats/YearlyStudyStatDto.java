package com.project.Band_Up.dtos.stats;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class YearlyStudyStatDto {
    private int year;
    private Integer totalMinutes;
    private List<Integer> monthlyMinutes;
}

