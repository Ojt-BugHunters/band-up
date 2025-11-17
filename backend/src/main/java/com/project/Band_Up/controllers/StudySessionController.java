package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.studySession.StudySessionCreateRequest;
import com.project.Band_Up.dtos.studySession.StudySessionResponse;
import com.project.Band_Up.dtos.studySessionInterval.StudySessionIntervalUpdateRequest;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.services.studySession.StudySessionService;
import com.project.Band_Up.utils.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
            @RequestBody StudySessionCreateRequest request
    ) {
        StudySessionResponse response = studySessionService.createStudySession(request, userDetails.getAccountId());
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
        return ResponseEntity.ok(studySessionService.pauseInterval(sessionId, intervalId));
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
}
