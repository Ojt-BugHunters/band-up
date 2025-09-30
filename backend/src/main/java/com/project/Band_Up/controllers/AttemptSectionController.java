package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.attemptSection.AttemptSectionCreateRequest;
import com.project.Band_Up.dtos.attemptSection.AttemptSectionResponse;
import com.project.Band_Up.services.attemptSection.AttemptSectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping(value = "/api/attempt-sections", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "AttemptSection API", description = "Các endpoint để quản lý AttemptSection (tạo, đọc, xóa).")
@RequiredArgsConstructor
@Validated
@CrossOrigin
public class AttemptSectionController {

    private final AttemptSectionService attemptSectionService;

    @Operation(
            summary = "Tạo AttemptSection mới cho một Attempt và Section",
            description = "Tạo một AttemptSection liên kết Attempt (attemptId) và Section (sectionId). " +
                    "Trả về AttemptSectionResponse mới tạo cùng HTTP 201 và header Location tới resource."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tạo thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "Attempt hoặc Section không tồn tại")
    })
    @PostMapping(value = "/{attemptId}/section/{sectionId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AttemptSectionResponse> createAttemptSection(
            @Parameter(description = "UUID của Attempt", required = true) @PathVariable("attemptId") UUID attemptId,
            @Parameter(description = "UUID của Section", required = true) @PathVariable("sectionId") UUID sectionId,
            @Valid @RequestBody AttemptSectionCreateRequest request) {

        AttemptSectionResponse created = attemptSectionService.createAttemptSection(attemptId, sectionId, request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .replacePath("/api/attempt-sections/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @Operation(
            summary = "Lấy tất cả AttemptSections của một Attempt",
            description = "Trả về danh sách AttemptSection thuộc về một Attempt (sắp xếp theo startAt giảm dần)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "404", description = "Attempt không tồn tại")
    })
    @GetMapping("/by-attempt/{attemptId}")
    public ResponseEntity<List<AttemptSectionResponse>> getAllAttemptSectionsByAttemptId(
            @Parameter(description = "UUID của Attempt", required = true) @PathVariable("attemptId") UUID attemptId) {

        List<AttemptSectionResponse> list = attemptSectionService.getAllAttemptSectionsByAttemptId(attemptId);
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "Lấy AttemptSection theo Attempt và Section",
            description = "Trả về một AttemptSection xác định bởi attemptId và sectionId."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tìm thấy"),
            @ApiResponse(responseCode = "404", description = "AttemptSection không tồn tại")
    })
    @GetMapping("/by-attempt/{attemptId}/by-section/{sectionId}")
    public ResponseEntity<AttemptSectionResponse> getAttemptSectionByAttemptIdAndSectionId(
            @Parameter(description = "UUID của Attempt", required = true) @PathVariable("attemptId") UUID attemptId,
            @Parameter(description = "UUID của Section", required = true) @PathVariable("sectionId") UUID sectionId) {

        AttemptSectionResponse resp = attemptSectionService.getAttemptSectionByAttemptIdAndSectionId(attemptId, sectionId);
        return ResponseEntity.ok(resp);
    }

    @Operation(
            summary = "Xóa AttemptSection theo id",
            description = "Xóa AttemptSection theo UUID. Trả về 204 No Content khi xóa thành công, 404 nếu không tìm thấy."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "404", description = "AttemptSection không tồn tại")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttemptSection(
            @Parameter(description = "UUID của AttemptSection cần xóa", required = true) @PathVariable("id") UUID id) {

        attemptSectionService.deleteAttemptSection(id);
        return ResponseEntity.noContent().build();
    }
}
