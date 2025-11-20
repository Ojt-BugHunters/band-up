package com.project.Band_Up.dtos.studySession;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DailyStudyStatDto {

    private LocalDate date;

    private Integer totalMinutes;

    private List<Integer> hourlyMinutes;

}
