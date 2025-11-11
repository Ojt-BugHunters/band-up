package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.answer.AnswerCreateRequest;
import com.project.Band_Up.dtos.answer.AnswerResponse;
import com.project.Band_Up.services.answer.DictationAnswerServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/answers")
@RequiredArgsConstructor
@Tag(name = "Answer API", description = "Quản lý bài làm (Answer) của thí sinh trong phần thi — bao gồm Dictation scoring, lấy kết quả, và xóa kết quả.")
public class AnswerController {

    private final DictationAnswerServiceImpl dictationAnswerService;

    // ==========================================================
    // 🟢 GET - Lấy lại kết quả bài làm theo attemptSectionId + questionId
    // ==========================================================
    @Operation(
            summary = "Lấy kết quả bài làm của thí sinh",
            description = "Trả về thông tin chi tiết về câu trả lời, trạng thái đúng/sai, danh sách lỗi (mistakes), và thời gian tạo.",
            parameters = {
                    @Parameter(name = "attemptSectionId", description = "ID của attempt section (lượt làm bài)", required = true),
                    @Parameter(name = "questionId", description = "ID của câu hỏi", required = true)
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Lấy kết quả thành công",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = AnswerResponse.class))),
                    @ApiResponse(responseCode = "404", description = "Không tìm thấy câu trả lời cho attemptSectionId/questionId đã cho")
            }
    )
    @GetMapping("/{attemptSectionId}/{questionId}")
    public ResponseEntity<AnswerResponse> getAnswerByAttemptAndQuestion(
            @PathVariable UUID attemptSectionId,
            @PathVariable UUID questionId
    ) {
        return ResponseEntity.ok(dictationAnswerService.getAnswerByAttemptSectionIdAndQuestionId(attemptSectionId, questionId));
    }

    // ==========================================================
    // 🟡 POST - Nộp câu trả lời dictation để chấm điểm
    // ==========================================================
    @Operation(
            summary = "Nộp câu trả lời Dictation để chấm điểm",
            description = "Nhận câu trả lời của người dùng (answerContent), so sánh với đáp án đúng (script trong Question), chấm điểm, xác định lỗi (mistakes) và lưu vào DB.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Câu trả lời người dùng nhập (text answer)",
                    required = true,
                    content = @Content(schema = @Schema(implementation = AnswerCreateRequest.class))
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "Chấm điểm thành công",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = AnswerResponse.class))),
                    @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
                    @ApiResponse(responseCode = "404", description = "Không tìm thấy AttemptSection hoặc Question tương ứng")
            }
    )
    @PostMapping("/{attemptSectionId}/{questionId}")
    public ResponseEntity<AnswerResponse> submitAnswer(
            @PathVariable UUID attemptSectionId,
            @PathVariable UUID questionId,
            @RequestBody AnswerCreateRequest request
    ) {
        return ResponseEntity.ok(dictationAnswerService.submitAnswer(attemptSectionId, questionId, request));
    }
//jj
    // ==========================================================
    // 🔴 DELETE - Xóa câu trả lời của thí sinh
    // ==========================================================
    @Operation(
            summary = "Xóa câu trả lời",
            description = "Xóa bài làm cụ thể của một câu hỏi trong một attempt section (dành cho admin hoặc khi user làm lại bài).",
            parameters = {
                    @Parameter(name = "attemptSectionId", description = "ID của attempt section", required = true),
                    @Parameter(name = "questionId", description = "ID của câu hỏi", required = true)
            },
            responses = {
                    @ApiResponse(responseCode = "204", description = "Xóa thành công"),
                    @ApiResponse(responseCode = "404", description = "Không tìm thấy câu trả lời cần xóa")
            }
    )
    @DeleteMapping("/{attemptSectionId}/{questionId}")
    public ResponseEntity<Void> deleteAnswer(
            @PathVariable UUID attemptSectionId,
            @PathVariable UUID questionId
    ) {
        dictationAnswerService.deleteAnswer(attemptSectionId, questionId);
        return ResponseEntity.noContent().build();
    }
}
