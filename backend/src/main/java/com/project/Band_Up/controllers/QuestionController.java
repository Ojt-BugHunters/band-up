package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.question.QuestionCreateRequest;
import com.project.Band_Up.dtos.question.QuestionResponse;
import com.project.Band_Up.dtos.question.QuestionUpdateRequest;
import com.project.Band_Up.services.question.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Question API", description = "Các endpoint để quản lý Question (tạo, đọc, cập nhật, xóa).")
@RequiredArgsConstructor
@Validated
@CrossOrigin
public class QuestionController {

    private final QuestionService questionService;

    @Operation(
            summary = "Tạo Question mới trong Section",
            description = "Tạo một Question mới thuộc về Section chỉ định. " +
                    "Trả về đối tượng QuestionResponse mới tạo cùng HTTP 201 và header Location tới resource."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tạo thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "Section không tồn tại")
    })
    @PostMapping(value = "/sections/{sectionId}/questions", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<QuestionResponse> createQuestion(
            @Parameter(description = "UUID của Section để gắn Question vào", required = true)
            @PathVariable UUID sectionId,
            @Valid @RequestBody QuestionCreateRequest request) {

        QuestionResponse created = questionService.createQuestion(sectionId, request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }
    @Operation(
            summary = "Tạo nhiều Questions trong 1 Section",
            description = "Nhận danh sách QuestionCreateRequest và tạo nhiều question cùng lúc trong 1 Section. " +
                    "Trả về list QuestionResponse."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tạo thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "Section không tồn tại")
    })
    @PostMapping(value = "/sections/{sectionId}/questions/bulk", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<QuestionResponse>> createMultipleQuestions(
            @Parameter(description = "UUID của Section để gắn các Question vào", required = true)
            @PathVariable UUID sectionId,
            @Valid @RequestBody List<QuestionCreateRequest> requests) {

        List<QuestionResponse> createdList = questionService.createMultipleQuestions(sectionId, requests);

        return ResponseEntity.status(201).body(createdList);
    }


    @Operation(
            summary = "Lấy tất cả Questions trong Section",
            description = "Trả về danh sách tất cả Questions thuộc Section có sectionId cho trước."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "404", description = "Section không tồn tại")
    })
    @GetMapping("/sections/{sectionId}/questions")
    public ResponseEntity<List<QuestionResponse>> getAllQuestionsBySectionId(
            @Parameter(description = "UUID của Section", required = true)
            @PathVariable UUID sectionId) {
        List<QuestionResponse> list = questionService.getAllQuestionsBySectionId(sectionId);
        return ResponseEntity.ok(list);
    }
    @Operation(
            summary = "Lấy Question theo id",
            description = "Lấy một Question theo UUID. Trả về 200 với QuestionResponse nếu tìm thấy, 404 nếu không."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tìm thấy"),
            @ApiResponse(responseCode = "404", description = "Question không tồn tại")
    })
    @GetMapping("/questions/{id}")
    public ResponseEntity<QuestionResponse> getQuestionById(
            @Parameter(description = "UUID của Question", required = true)
            @PathVariable("id") UUID questionId) {
        QuestionResponse resp = questionService.getQuestionById(questionId);
        return ResponseEntity.ok(resp);
    }

    @Operation(
            summary = "Cập nhật Question theo id",
            description = "Cập nhật các trường của một Question cụ thể. Chỉ cần gửi các field muốn cập nhật trong body."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "Question không tồn tại")
    })
    @PutMapping(value = "/questions/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<QuestionResponse> updateQuestion(
            @Parameter(description = "UUID của Question cần cập nhật", required = true)
            @PathVariable("id") UUID questionId,
            @Valid @RequestBody QuestionUpdateRequest request) {
        QuestionResponse updated = questionService.updateQuestionById(questionId, request);
        return ResponseEntity.ok(updated);
    }

    @Operation(
            summary = "Xóa Question theo id",
            description = "Xóa một Question dựa trên UUID. Trả về 204 No Content nếu xóa thành công."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "404", description = "Question không tồn tại")
    })
    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(
            @Parameter(description = "UUID của Question cần xóa", required = true)
            @PathVariable("id") UUID questionId) {
        questionService.deleteQuestionById(questionId);
        return ResponseEntity.noContent().build();
    }
}
