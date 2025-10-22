package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.section.SectionCreateRequest;
import com.project.Band_Up.dtos.section.SectionResponse;
import com.project.Band_Up.dtos.section.SectionUpdateRequest;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.services.section.SectionService;
import com.project.Band_Up.utils.JwtUserDetails;
import com.project.Band_Up.utils.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.query.Param;
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
@RequestMapping(value = "/api/sections", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Section API", description = "Các endpoint để quản lý Section (tạo, đọc, cập nhật, xóa).")
@RequiredArgsConstructor
@Validated
@CrossOrigin
public class SectionController {

    private final SectionService sectionService;
    private final JwtUtil jwtUtil;

    @Operation(
            summary = "Tạo Section mới cho Test",
            description = "Tạo một Section mới thuộc Test (theo testId). Trả về SectionResponse và HTTP 201 cùng header Location tới resource."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tạo thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ (vd: thiếu trường bắt buộc)"),
            @ApiResponse(responseCode = "404", description = "Test không tồn tại")
    })
    @PostMapping(value = "/test/{testId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SectionResponse> createSection(
            @Parameter(description = "UUID của Test mà section sẽ thuộc về", required = true)
            @PathVariable("testId") UUID testId,
            @Valid @RequestBody SectionCreateRequest request,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID accountId = userDetails.getAccountId();
        SectionResponse created = sectionService.createSection(request, testId, accountId);

        // Build Location header: /api/sections/test/{testId}/{id}
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @Operation(
            summary = "Lấy Section theo id",
            description = "Lấy một Section theo UUID. Trả về 200 với SectionResponse nếu tìm thấy, 404 nếu không."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tìm thấy"),
            @ApiResponse(responseCode = "404", description = "Section không tồn tại")
    })
    @GetMapping("/{id}")
    public ResponseEntity<SectionResponse> getSectionById(
            @Parameter(description = "UUID của Section", required = true) @PathVariable("id") UUID id) {
        SectionResponse resp = sectionService.getSectionById(id);
        return ResponseEntity.ok(resp);
    }

    @Operation(
            summary = "Lấy tất cả Sections của một Test (theo order tăng dần)",
            description = "Trả về danh sách Sections thuộc Test với testId, sắp xếp theo orderIndex tăng dần."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "404", description = "Test không tồn tại")
    })
    @GetMapping("/test/{testId}")
    public ResponseEntity<List<SectionResponse>> getSectionsByTestId(
            @Parameter(description = "UUID của Test", required = true) @PathVariable("testId") UUID testId) {
        List<SectionResponse> list = sectionService.getSectionsByTestId(testId);
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "Cập nhật Section",
            description = "Cập nhật các trường của Section theo id. Gửi SectionUpdateRequest. Trả về SectionResponse sau khi cập nhật."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "Section không tồn tại")
    })
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SectionResponse> updateSection(
            @Parameter(description = "UUID của Section cần cập nhật", required = true) @PathVariable("id") UUID id,
            @Valid @RequestBody SectionUpdateRequest request,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        UUID accountId = userDetails.getAccountId();
        SectionResponse updated = sectionService.updateSection(id, request, accountId);
        return ResponseEntity.ok(updated);
    }

    @Operation(
            summary = "Xóa Section theo id",
            description = "Xóa Section theo UUID. Trả về 204 No Content khi xóa thành công, 404 nếu không tìm thấy."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "404", description = "Section không tồn tại")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSection(
            @Parameter(description = "UUID của Section cần xóa", required = true) @PathVariable("id") UUID id,
            @AuthenticationPrincipal JwtUserDetails userDetails)
            {
        UUID accountId = userDetails.getAccountId();
        sectionService.deleteSection(id, accountId);
        return ResponseEntity.noContent().build();
    }
    @Operation(
            summary = "Xóa tất cả section theo TestId với Status",
            description = "Xóa Section theo TestId và StatusDraft. Trả về 204 No Content khi xóa thành công, 404 nếu không tìm thấy."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "404", description = "Section không tồn tại")
    })
    @DeleteMapping("/{testId}")
    public ResponseEntity<Void> deletedSectionByTestIdandStatus(
        @PathVariable UUID testId,
        @RequestParam Status status){
        sectionService.deleteAllDraftSections(testId, status);
        return ResponseEntity.noContent().build();
    }

}
