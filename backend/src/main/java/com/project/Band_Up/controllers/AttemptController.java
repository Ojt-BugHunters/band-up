package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.attempt.AttemptCreateRequest;
import com.project.Band_Up.dtos.attempt.AttemptResponse;
import com.project.Band_Up.dtos.attempt.AttemptUpdateRequest;
import com.project.Band_Up.services.attempt.AttemptService;
import com.project.Band_Up.utils.JwtUserDetails;
import com.project.Band_Up.utils.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/attempts", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Attempt API", description = "Các endpoint để quản lý Attempt (tạo, đọc, cập nhật, xóa).")
@RequiredArgsConstructor
@Validated
@CrossOrigin
public class AttemptController {

    private final AttemptService attemptService;
    private final JwtUtil jwtUtil;

    @Operation(
            summary = "Tạo Attempt mới cho một Test",
            description = "Tạo một Attempt mới cho testId. User hiện tại (lấy từ cookie AccessToken) sẽ được dùng làm owner. " +
                    "Trả về AttemptResponse mới tạo cùng HTTP 201 và header Location tới resource."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tạo thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "User hoặc Test không tồn tại")
    })
    @PostMapping(value = "/{testId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AttemptResponse> createAttempt(
            @Parameter(description = "UUID của Test", required = true) @PathVariable("testId") UUID testId,
            @Valid @RequestBody AttemptCreateRequest request,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        AttemptResponse created = attemptService.createAttempt(userDetails.getAccountId(), testId, request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @Operation(
            summary = "Lấy tất cả Attempts của một User",
            description = "Trả về danh sách Attempts của user theo userId (mới nhất trước)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "404", description = "User không tồn tại")
    })
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<AttemptResponse>> getAllAttemptsByUserId(
            @Parameter(description = "UUID của User", required = true) @PathVariable("userId") UUID userId) {

        List<AttemptResponse> list = attemptService.getAllAttemptsByUserId(userId);
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "Lấy tất cả Attempts của một User cho một Test cụ thể",
            description = "Trả về danh sách Attempts của user theo userId và testId (mới nhất trước)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "404", description = "User hoặc Test không tồn tại")
    })
    @GetMapping("/by-user/{userId}/by-test/{testId}")
    public ResponseEntity<List<AttemptResponse>> getAllAttemptsByUserIdAndTestId(
            @Parameter(description = "UUID của User", required = true) @PathVariable("userId") UUID userId,
            @Parameter(description = "UUID của Test", required = true) @PathVariable("testId") UUID testId) {

        List<AttemptResponse> list = attemptService.getAllAttemptsByUserIdAndTestId(userId, testId);
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "Lấy Attempt theo id",
            description = "Lấy một Attempt theo UUID. Trả về 200 với AttemptResponse nếu tìm thấy, 404 nếu không."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tìm thấy"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy Attempt")
    })
    @GetMapping("/{id}")
    public ResponseEntity<AttemptResponse> getAttemptById(
            @Parameter(description = "UUID của Attempt", required = true) @PathVariable("id") UUID id) {

        AttemptResponse resp = attemptService.getAttemptById(id);
        return ResponseEntity.ok(resp);
    }

    @Operation(
            summary = "Lấy Attempts theo user và status",
            description = "Trả về danh sách Attempts của user có trạng thái status (ví dụ: IN_PROGRESS, COMPLETED)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "404", description = "User không tồn tại")
    })
    @GetMapping("/by-user/{userId}/by-status")
    public ResponseEntity<List<AttemptResponse>> getAttemptsByUserIdAndStatus(
            @Parameter(description = "UUID của User", required = true) @PathVariable("userId") UUID userId,
            @Parameter(description = "Trạng thái Attempt (vd: IN_PROGRESS, COMPLETED)", required = true)
            @RequestParam("status") String status) {

        List<AttemptResponse> list = attemptService.getAttemptsByUserIdAndStatus(userId, status);
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "Cập nhật Attempt",
            description = "Cập nhật Attempt (chỉ owner mới có quyền). Gửi AttemptUpdateRequest."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "403", description = "Không có quyền cập nhật Attempt này"),
            @ApiResponse(responseCode = "404", description = "Attempt không tồn tại")
    })
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AttemptResponse> updateAttempt(
            @Parameter(description = "UUID của Attempt", required = true) @PathVariable("id") UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "AttemptUpdateRequest JSON. Ví dụ: { \"status\": \"COMPLETED\", \"score\": 85 }",
                    required = true
            )
            @Valid @RequestBody AttemptUpdateRequest request,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        AttemptResponse updated = attemptService.updateAttempt(id, userDetails.getAccountId(), request);
        return ResponseEntity.ok(updated);
    }

    @Operation(
            summary = "Xóa Attempt",
            description = "Xóa Attempt theo ID (chỉ owner mới có quyền). Trả về 204 khi xóa thành công."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "403", description = "Không có quyền xóa Attempt này"),
            @ApiResponse(responseCode = "404", description = "Attempt không tồn tại")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttempt(
            @Parameter(description = "UUID của Attempt cần xóa", required = true) @PathVariable("id") UUID id,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        attemptService.deleteAttempt(id, userDetails.getAccountId());
        return ResponseEntity.noContent().build();
    }
}
