package com.project.Band_Up.services.analytics.sessionStats;

import com.project.Band_Up.dtos.stats.ActivitiesSummaryDto;
import com.project.Band_Up.dtos.stats.DailyStudyStatDto;
import com.project.Band_Up.dtos.stats.MonthlyStudyStatDto;
import com.project.Band_Up.dtos.stats.YearlyStudyStatDto;
import com.project.Band_Up.entities.StudyInterval;
import com.project.Band_Up.entities.StudySession;
import com.project.Band_Up.repositories.StudyIntervalRepository;
import com.project.Band_Up.repositories.StudySessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class StudyStatsServiceImpl implements StudyStatsService {

    private final StudyIntervalRepository repo;
    private final StudySessionRepository studySessionRepository;

    @Override
    public DailyStudyStatDto getDailyStats(UUID userId, LocalDate date) {
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = dayStart.plusDays(1);

        List<StudyInterval> intervals = repo.findByUserAndOverlapRange(userId, dayStart, dayEnd);

        int[] hourly = new int[24];
        int total = 0;

        for (StudyInterval si : intervals) {
            LocalDateTime s = Optional.ofNullable(si.getStartAt()).orElse(dayStart);
            LocalDateTime e = Optional.ofNullable(si.getEndedAt()).orElse(LocalDateTime.now());

            if (s.isBefore(dayStart)) s = dayStart;
            if (e.isAfter(dayEnd)) e = dayEnd;
            if (!e.isAfter(s)) continue;

            total += (int) ChronoUnit.MINUTES.between(s, e);

            LocalDateTime cursor = s;
            while (cursor.isBefore(e)) {
                LocalDateTime hourEnd = cursor.truncatedTo(ChronoUnit.HOURS).plusHours(1);
                if (hourEnd.isAfter(e)) hourEnd = e;
                int mins = (int) ChronoUnit.MINUTES.between(cursor, hourEnd);
                hourly[cursor.getHour()] += mins;
                cursor = hourEnd;
            }
        }

        List<Integer> hourlyList = IntStream.of(hourly).boxed().collect(Collectors.toList());
        return DailyStudyStatDto.builder()
                .date(date)
                .totalMinutes(total)
                .hourlyMinutes(hourlyList)
                .build();
    }

    @Override
    public MonthlyStudyStatDto getMonthlyStats(UUID userId, YearMonth month) {
        LocalDate firstDay = month.atDay(1);
        LocalDateTime rangeStart = firstDay.atStartOfDay();
        LocalDateTime rangeEnd = firstDay.plusMonths(1).atStartOfDay();

        List<StudyInterval> intervals = repo.findByUserAndOverlapRange(userId, rangeStart, rangeEnd);

        int days = month.lengthOfMonth();
        int[] daily = new int[days];
        int total = 0;

        for (StudyInterval si : intervals) {
            LocalDateTime s = Optional.ofNullable(si.getStartAt()).orElse(rangeStart);
            LocalDateTime e = Optional.ofNullable(si.getEndedAt()).orElse(LocalDateTime.now());

            if (s.isBefore(rangeStart)) s = rangeStart;
            if (e.isAfter(rangeEnd)) e = rangeEnd;
            if (!e.isAfter(s)) continue;

            LocalDateTime cursor = s;
            while (cursor.isBefore(e)) {
                LocalDateTime dayEnd = cursor.toLocalDate().atStartOfDay().plusDays(1);
                if (dayEnd.isAfter(e)) dayEnd = e;
                int mins = (int) ChronoUnit.MINUTES.between(cursor, dayEnd);
                int index = cursor.getDayOfMonth() - 1;
                daily[index] += mins;
                total += mins;
                cursor = dayEnd;
            }
        }

        List<Integer> dailyList = Arrays.stream(daily).boxed().collect(Collectors.toList());
        return MonthlyStudyStatDto.builder()
                .year(month.getYear())
                .month(month.getMonthValue())
                .totalMinutes(total)
                .dailyMinutes(dailyList)
                .build();
    }

    @Override
    public YearlyStudyStatDto getYearlyStats(UUID userId, int year) {
        LocalDateTime rangeStart = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime rangeEnd = rangeStart.plusYears(1);

        List<StudyInterval> intervals = repo.findByUserAndOverlapRange(userId, rangeStart, rangeEnd);

        int[] monthly = new int[12];
        int total = 0;

        for (StudyInterval si : intervals) {
            LocalDateTime s = Optional.ofNullable(si.getStartAt()).orElse(rangeStart);
            LocalDateTime e = Optional.ofNullable(si.getEndedAt()).orElse(LocalDateTime.now());

            if (s.isBefore(rangeStart)) s = rangeStart;
            if (e.isAfter(rangeEnd)) e = rangeEnd;
            if (!e.isAfter(s)) continue;

            LocalDateTime cursor = s;
            while (cursor.isBefore(e)) {
                LocalDateTime monthEnd = cursor.withDayOfMonth(1).plusMonths(1)
                        .withHour(0).withMinute(0).withSecond(0).withNano(0);
                if (monthEnd.isAfter(e)) monthEnd = e;
                int mins = (int) ChronoUnit.MINUTES.between(cursor, monthEnd);
                int index = cursor.getMonthValue() - 1;
                monthly[index] += mins;
                total += mins;
                cursor = monthEnd;
            }
        }

        List<Integer> monthlyList = Arrays.stream(monthly).boxed().collect(Collectors.toList());
        return YearlyStudyStatDto.builder()
                .year(year)
                .totalMinutes(total)
                .monthlyMinutes(monthlyList)
                .build();
    }
    @Override
    public ActivitiesSummaryDto getActivities (UUID userId, LocalDate date){
        LocalDate today = LocalDate.now();              // ngày hôm nay
        LocalDateTime start = today.atStartOfDay();     // 00:00 hôm nay
        LocalDateTime end = start.plusDays(1);          // 00:00 ngày mai
        Integer todaySession = studySessionRepository.countSessionsInRange(start, end, userId);
        return null;
    }
}
