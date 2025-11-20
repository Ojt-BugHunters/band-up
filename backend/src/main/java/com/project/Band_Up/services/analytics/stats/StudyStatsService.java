package com.project.Band_Up.services.analytics.stats;

import com.project.Band_Up.dtos.stats.DailyStudyStatDto;
import com.project.Band_Up.dtos.stats.MonthlyStudyStatDto;
import com.project.Band_Up.dtos.stats.YearlyStudyStatDto;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;

public interface StudyStatsService {

    DailyStudyStatDto getDailyStats(UUID userId, LocalDate date);

    MonthlyStudyStatDto getMonthlyStats(UUID userId, YearMonth month);

    YearlyStudyStatDto getYearlyStats(UUID userId, int year);
}
