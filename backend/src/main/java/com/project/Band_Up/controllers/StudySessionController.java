package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.studySession.StudySessionCreateRequest;
import com.project.Band_Up.dtos.studySession.StudySessionResponse;
import com.project.Band_Up.services.studySession.StudySessionService;
import com.project.Band_Up.utils.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/study-sessions")
@RequiredArgsConstructor
@Tag(name = "Study Session API", description = "Quản lý các phiên học (StudySession) của người dùng")
public class StudySessionController {

    private final StudySessionService studySessionService;

    /**
     * 🟢 Tạo mới một StudySession cho user (và tự động sinh các StudyInterval xen kẽ)
     */
    @Operation(
            summary = "Tạo mới StudySession",
            description = "Tạo một phiên học mới cho user, sau đó tự động sinh các StudyInterval xen kẽ (Focus / ShortBreak / LongBreak)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tạo thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy user")
    })
    @PostMapping("/create")
    public ResponseEntity<StudySessionResponse> createStudySession(
            @Parameter(description = "ID của user (UUID)", required = true)
            @AuthenticationPrincipal JwtUserDetails userDetails,

            @Parameter(description = "Thông tin phiên học cần tạo", required = true)
            @RequestBody StudySessionCreateRequest request
    ) {
        StudySessionResponse response = studySessionService.createStudySession(request, userDetails.getAccountId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Bạn có thể thêm GET /{id} hoặc GET /user/{userId} sau này để xem danh sách session
}
