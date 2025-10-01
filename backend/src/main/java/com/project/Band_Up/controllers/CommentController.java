package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.comment.CommentCreateRequest;
import com.project.Band_Up.dtos.comment.CommentResponse;
import com.project.Band_Up.dtos.comment.CommentUpdateRequest;
import com.project.Band_Up.services.comment.CommentService;
import com.project.Band_Up.utils.JwtUserDetails;
import com.project.Band_Up.utils.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/comments", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Comment API", description = "Các endpoint để quản lý Comment (tạo, đọc, cập nhật, xóa).")
@RequiredArgsConstructor
@Validated
@CrossOrigin
public class CommentController {

    private final CommentService commentService;
    private final JwtUtil jwtUtil;

    @Operation(
            summary = "Tạo Comment mới",
            description = "Tạo một Comment mới cho Test. " +
                    "Cần `testId` và `AccessToken` trong cookie để xác định user. " +
                    "Trả về CommentResponse sau khi tạo."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tạo thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "User hoặc Test không tồn tại")
    })
    @PostMapping(value = "/{testId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CommentResponse> createComment(
            @Parameter(description = "UUID của Test", required = true) @PathVariable("testId") UUID testId,
            @Valid @RequestBody CommentCreateRequest request,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        CommentResponse created = commentService.createComment(userDetails.getAccountId(), testId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(
            summary = "Lấy tất cả Comments theo Test",
            description = "Trả về danh sách Comments của một Test, sắp xếp theo thời gian tạo (mới nhất trước)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "404", description = "Test không tồn tại")
    })
    @GetMapping("/by-test/{testId}")
    public ResponseEntity<List<CommentResponse>> getCommentsByTestId(
            @Parameter(description = "UUID của Test", required = true) @PathVariable("testId") UUID testId) {
        List<CommentResponse> list = commentService.getAllCommentsByTestId(testId);
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "Cập nhật Comment",
            description = "Cập nhật Comment theo ID. Chỉ chủ sở hữu comment mới có thể sửa."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "403", description = "Không có quyền sửa Comment này"),
            @ApiResponse(responseCode = "404", description = "Comment không tồn tại")
    })
    @PutMapping(value = "/{commentId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CommentResponse> updateComment(
            @Parameter(description = "UUID của Comment", required = true) @PathVariable("commentId") UUID commentId,
            @Valid @RequestBody CommentUpdateRequest request,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        CommentResponse updated = commentService.updateComment(commentId, userDetails.getAccountId(), request);
        return ResponseEntity.ok(updated);
    }

    @Operation(
            summary = "Xóa Comment",
            description = "Xóa Comment theo ID. Chỉ chủ sở hữu mới có quyền xóa."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "403", description = "Không có quyền xóa Comment này"),
            @ApiResponse(responseCode = "404", description = "Comment không tồn tại")
    })
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @Parameter(description = "UUID của Comment cần xóa", required = true) @PathVariable("commentId") UUID commentId,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        commentService.deleteComment(commentId, userDetails.getAccountId());
        return ResponseEntity.noContent().build();
    }
    @Operation(
            summary = "Đếm số lượng Comments của một Test",
            description = "Trả về tổng số comment thuộc về Test theo UUID."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "404", description = "Test không tồn tại")
    })
    @GetMapping("/count/by-test/{testId}")
    public ResponseEntity<Integer> countCommentsByTestId(
            @Parameter(description = "UUID của Test", required = true) @PathVariable("testId") UUID testId) {
        Integer count = commentService.countCommentsByTestId(testId);
        return ResponseEntity.ok(count);
    }

}
