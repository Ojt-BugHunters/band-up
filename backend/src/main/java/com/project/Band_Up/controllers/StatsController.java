package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.stats.DailyStudyStatDto;
import com.project.Band_Up.dtos.stats.MonthlyStudyStatDto;
import com.project.Band_Up.dtos.stats.YearlyStudyStatDto;
import com.project.Band_Up.services.analytics.stats.StudyStatsService;
import com.project.Band_Up.utils.JwtUserDetails;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.YearMonth;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StudyStatsService studyStatsService;

    @GetMapping("/day")
    public ResponseEntity<?> getDailyStats(
            @AuthenticationPrincipal JwtUserDetails userDetails,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String dateStr
    ) {
        try {
            LocalDate date = LocalDate.parse(dateStr);
            DailyStudyStatDto dto = studyStatsService.getDailyStats(userDetails.getAccountId(), date);
            return ResponseEntity.ok(dto);
        } catch (DateTimeException e) {
            return ResponseEntity.badRequest().body("Invalid date format. Use yyyy-MM-dd.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid parameters.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Server error: " + e.getMessage());
        }
    }

    @GetMapping("/month")
    public ResponseEntity<?> getMonthlyStats(
            @AuthenticationPrincipal JwtUserDetails userDetails,
            @RequestParam("year") int year,
            @RequestParam("month") int month
    ) {
        try {
            YearMonth ym = YearMonth.of(year, month);
            MonthlyStudyStatDto dto = studyStatsService.getMonthlyStats(userDetails.getAccountId(), ym);
            return ResponseEntity.ok(dto);
        } catch (DateTimeException e) {
            return ResponseEntity.badRequest().body("Invalid year/month values.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid parameters.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Server error: " + e.getMessage());
        }
    }

    @GetMapping("/year")
    public ResponseEntity<?> getYearlyStats(
            @AuthenticationPrincipal JwtUserDetails userDetails,
            @RequestParam("year") int year
    ) {
        try {
            YearlyStudyStatDto dto = studyStatsService.getYearlyStats(userDetails.getAccountId(), year);
            return ResponseEntity.ok(dto);
        } catch (DateTimeException e) {
            return ResponseEntity.badRequest().body("Invalid year value.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid parameters.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Server error: " + e.getMessage());
        }
    }
}
