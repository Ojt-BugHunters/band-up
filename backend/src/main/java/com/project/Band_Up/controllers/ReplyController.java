package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.reply.ReplyCreateRequest;
import com.project.Band_Up.dtos.reply.ReplyResponse;
import com.project.Band_Up.dtos.reply.ReplyUpdateRequest;
import com.project.Band_Up.services.reply.ReplyService;
import com.project.Band_Up.utils.JwtUserDetails;
import com.project.Band_Up.utils.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/replies", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Reply API", description = "Các endpoint để quản lý Reply (tạo, đọc, cập nhật, xóa).")
@RequiredArgsConstructor
@Validated
@CrossOrigin
public class ReplyController {

    private final ReplyService replyService;
    private final JwtUtil jwtUtil;

    @Operation(
            summary = "Tạo Reply mới cho Comment",
            description = "User hiện tại (lấy từ AccessToken) sẽ tạo một Reply mới cho Comment có commentId."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tạo thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "User hoặc Comment không tồn tại")
    })
    @PostMapping(value = "/{commentId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ReplyResponse> createReply(
            @Parameter(description = "UUID của Comment cần reply", required = true)
            @PathVariable("commentId") UUID commentId,
            @Valid @RequestBody ReplyCreateRequest request,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        ReplyResponse created = replyService.createReplyForComment(userDetails.getAccountId(), commentId, request);

        URI location = URI.create(String.format("/api/replies/%s", created.getId()));
        return ResponseEntity.created(location).body(created);
    }

    @Operation(
            summary = "Lấy tất cả Replies của một Comment",
            description = "Trả về danh sách reply thuộc về một Comment, sắp xếp theo createAt giảm dần."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "404", description = "Comment không tồn tại")
    })
    @GetMapping("/by-comment/{commentId}")
    public ResponseEntity<List<ReplyResponse>> getAllRepliesByCommentId(
            @Parameter(description = "UUID của Comment", required = true)
            @PathVariable("commentId") UUID commentId) {

        List<ReplyResponse> list = replyService.getAllRepliesByCommentId(commentId);
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "Cập nhật Reply",
            description = "Chỉ user tạo Reply mới có quyền cập nhật nội dung Reply."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "403", description = "Không có quyền sửa Reply này"),
            @ApiResponse(responseCode = "404", description = "Reply không tồn tại")
    })
    @PutMapping(value = "/{replyId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ReplyResponse> updateReply(
            @Parameter(description = "UUID của Reply cần cập nhật", required = true)
            @PathVariable("replyId") UUID replyId,
            @Valid @RequestBody ReplyUpdateRequest request,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        ReplyResponse updated = replyService.updateReply(replyId, userDetails.getAccountId(), request);
        return ResponseEntity.ok(updated);
    }

    @Operation(
            summary = "Xóa Reply",
            description = "Chỉ user tạo Reply mới có quyền xóa Reply này."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "403", description = "Không có quyền xóa Reply này"),
            @ApiResponse(responseCode = "404", description = "Reply không tồn tại")
    })
    @DeleteMapping("/{replyId}")
    public ResponseEntity<Void> deleteReply(
            @Parameter(description = "UUID của Reply cần xóa", required = true)
            @PathVariable("replyId") UUID replyId,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        replyService.deleteReply(replyId, userDetails.getAccountId());
        return ResponseEntity.noContent().build();
    }
}
