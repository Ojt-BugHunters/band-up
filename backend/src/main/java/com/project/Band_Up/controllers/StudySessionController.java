package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.studySession.StudySessionCreateRequest;
import com.project.Band_Up.dtos.studySession.StudySessionResponse;
import com.project.Band_Up.dtos.studySession.TopUserStudyTimeDto;
import com.project.Band_Up.dtos.studySessionInterval.StudySessionIntervalUpdateRequest;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.enums.StatsInterval;
import com.project.Band_Up.services.studySession.StudySessionService;
import com.project.Band_Up.utils.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/study-sessions")
@RequiredArgsConstructor
@Tag(name = "Study Session API", description = "Quản lý các phiên học (StudySession) của người dùng")
public class StudySessionController {

    private final StudySessionService studySessionService;

    @Operation(summary = "Tạo mới StudySession",
            description = "Tạo một phiên học mới cho user, tự động sinh các interval xen kẽ (Focus/ShortBreak/LongBreak hoặc 1 interval nếu là StopWatch)")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tạo thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy user")
    })
    @PostMapping("/create")
    public ResponseEntity<StudySessionResponse> createStudySession(
            @AuthenticationPrincipal JwtUserDetails userDetails,
            @RequestBody StudySessionCreateRequest request,
            @RequestParam(required = false) UUID roomId
    ) {
        StudySessionResponse response = studySessionService.createStudySession(request, userDetails.getAccountId(), roomId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Bắt đầu interval",
            description = "Đánh dấu thời gian bắt đầu của interval và cập nhật session nếu cần")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Interval đã được bắt đầu"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy session hoặc interval")
    })
    @PostMapping("/{sessionId}/intervals/{intervalId}/start")
    public ResponseEntity<StudySessionResponse> startInterval(
            @PathVariable UUID sessionId,
            @PathVariable UUID intervalId
    ) {
        return ResponseEntity.ok(studySessionService.startInterval(sessionId, intervalId));
    }

    @Operation(summary = "Ping interval (cập nhật thời gian thực)",
            description = "Cập nhật thời gian ping và duration tạm thời của interval, đồng thời cập nhật tổng focus time cho session")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cập nhật ping thành công"),
            @ApiResponse(responseCode = "400", description = "Không thể ping khi interval chưa bắt đầu hoặc đã kết thúc")
    })
    @PatchMapping("/{sessionId}/intervals/{intervalId}/ping")
    public ResponseEntity<StudySessionResponse> pingInterval(
            @PathVariable UUID sessionId,
            @PathVariable UUID intervalId,
            @RequestBody(required = false) StudySessionIntervalUpdateRequest request
    ) {
        StudySessionResponse response = studySessionService.pingInterval(sessionId, intervalId, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Tạm dừng interval",
            description = "Chuyển trạng thái interval từ ONGOING sang PAUSED")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Đã tạm dừng interval"),
            @ApiResponse(responseCode = "400", description = "Chỉ có interval đang ONGOING mới có thể tạm dừng")
    })
    @PostMapping("/{sessionId}/intervals/{intervalId}/pause")
    public ResponseEntity<StudySessionResponse> pauseInterval(
            @PathVariable UUID sessionId,
            @PathVariable UUID intervalId
    ) {
        studySessionService.pauseInterval(sessionId, intervalId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Tiếp tục interval",
            description = "Chuyển trạng thái interval từ PAUSED sang ONGOING và cập nhật thời gian bắt đầu mới")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Đã tiếp tục interval"),
            @ApiResponse(responseCode = "400", description = "Chỉ có interval đang PAUSED mới có thể tiếp tục")
    })
    @PostMapping("/{sessionId}/intervals/{intervalId}/resume")
    public ResponseEntity<StudySessionResponse> resumeInterval(
            @PathVariable UUID sessionId,
            @PathVariable UUID intervalId
    ) {
       studySessionService.endPauseInterval(sessionId, intervalId);
       return ResponseEntity.ok().build();
    }

    @Operation(summary = "Kết thúc interval",
            description = "Đánh dấu thời gian kết thúc, tính duration, và nếu tất cả interval đã kết thúc thì cập nhật session là ENDED")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Kết thúc interval thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy session hoặc interval")
    })
    @PostMapping("/{sessionId}/intervals/{intervalId}/end")
    public ResponseEntity<StudySessionResponse> endInterval(
            @PathVariable UUID sessionId,
            @PathVariable UUID intervalId
    ) {
        return ResponseEntity.ok(studySessionService.endInterval(sessionId, intervalId));
    }

    @Operation(summary = "Reset interval",
            description = "Đặt lại trạng thái của interval về ban đầu (PENDING), xóa các mốc thời gian và duration")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reset interval thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy session hoặc interval")
    })
    @PostMapping("/{sessionId}/intervals/{intervalId}/reset")
    public ResponseEntity<StudySessionResponse> resetInterval(
            @PathVariable UUID sessionId,
            @PathVariable UUID intervalId
    ) {
        return ResponseEntity.ok(studySessionService.resetInterval(sessionId, intervalId));
    }
    @Operation(summary = "lấy StudySession theo Status",
            description = "Lấy tất cả phiên học của user theo trạng thái ( PENDING, ONGOING, ENDED)")
    @ApiResponses ({
            @ApiResponse(responseCode = "200", description = "Lấy thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy user")
    })
    @GetMapping("/status/{status}")
    public ResponseEntity<List<StudySessionResponse>> getStudySessionsByStatus(
            @AuthenticationPrincipal JwtUserDetails userDetails,
            @PathVariable Status status
    ) {
        List<StudySessionResponse> response = studySessionService.getStudySessionByStatus(userDetails.getAccountId(), status);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get Top 10 Users by Study Time",
            description = "Retrieve top 10 users with the longest total study time in StudySession by selected date, week, or month. Returns rank, user name, and total time.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved top users"),
            @ApiResponse(responseCode = "400", description = "Invalid interval or date format")
    })
    @GetMapping("/top-users")
    public ResponseEntity<List<TopUserStudyTimeDto>> getTopUsersByStudyTime(
            @Parameter(description = "Time interval for statistics (DAILY, WEEKLY, MONTHLY)",
                    required = true,
                    example = "DAILY")
            @RequestParam StatsInterval interval,
            @Parameter(description = "Reference date (for DAILY: specific day, for WEEKLY: start of week, for MONTHLY: any day in month)",
                    required = true,
                    example = "2024-12-06")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<TopUserStudyTimeDto> topUsers = studySessionService.getTopUsersByStudyTime(interval, date);
        return ResponseEntity.ok(topUsers);
    }
}
