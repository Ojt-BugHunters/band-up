package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.test.TestCreateRequest;
import com.project.Band_Up.dtos.test.TestResponse;
import com.project.Band_Up.dtos.test.TestUpdateRequest;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.services.test.TestService;
import com.project.Band_Up.utils.JwtUserDetails;
import com.project.Band_Up.utils.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
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
@RequestMapping(value = "/api/tests", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Test API", description = "Các endpoint để quản lý Test (tạo, đọc, cập nhật, xóa).")
@RequiredArgsConstructor
@Validated
@CrossOrigin
public class TestController {

    private final TestService testService;
    private final JwtUtil jwtUtil;
    @Operation(
            summary = "Tạo Test mới",
            description = "Tạo một Test mới. Trường `userId` là bắt buộc (UUID dạng chuỗi) để liên kết Test với Account. " +
                    "Trả về đối tượng TestResponse mới tạo cùng HTTP 201 và header Location tới resource."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tạo thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ (vd: thiếu trường bắt buộc)"),
            @ApiResponse(responseCode = "404", description = "User không tồn tại")
    })
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TestResponse> createTest(
            @Valid @RequestBody TestCreateRequest request,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        TestResponse created = testService.createTest(userDetails.getAccountId(), request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @Operation(
            summary = "Lấy tất cả Tests",
            description = "Trả về danh sách tất cả Tests dưới dạng TestResponse."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công")
    })
    @GetMapping
    public ResponseEntity<List<TestResponse>> getAllTests() {
        List<TestResponse> list = testService.getAllTests();
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "Lấy tất cả Tests (sắp xếp theo createAt giảm dần)",
            description = "Trả về danh sách Tests được sắp xếp theo thời gian tạo (mới nhất trước)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công")
    })
    @GetMapping("/sorted")
    public ResponseEntity<List<TestResponse>> getAllTestsSorted() {
        List<TestResponse> list = testService.getAllTestsSortedByCreateAt();
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "Lấy Test theo id",
            description = "Lấy một Test theo UUID. Trả về 200 với TestResponse nếu tìm thấy, 404 nếu không."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tìm thấy"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy Test")
    })
    @GetMapping("/{id}")
    public ResponseEntity<TestResponse> getTestById(@PathVariable UUID id) {
        return ResponseEntity.ok(testService.getTestById(id));
    }
    @Operation(
            summary = "tăng view Test theo id",
            description = "Tăng view một Test theo UUID. Trả về 200 với TestResponse nếu tìm thấy, 404 nếu không."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tìm thấy"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy Test")
    })
    @PostMapping("/{id}/increase-view")
    public ResponseEntity<TestResponse> increaseViewCount(@PathVariable UUID id) {
        TestResponse response = testService.plusNumberOfMembers(id);
        return ResponseEntity.ok(response);
    }


    @Operation(
            summary = "Lấy Tests theo skillName",
            description = "Trả về danh sách Tests có cùng skillName (tương đương truy vấn exact match)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công")
    })
    @GetMapping("/by-skill")
    public ResponseEntity<List<TestResponse>> getBySkillName(
            @Parameter(description = "Tên kỹ năng (skillName) để lọc", required = true)
            @RequestParam("skillName") String skillName) {
        List<TestResponse> list = testService.getTestsBySkillName(skillName);
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "Tìm kiếm Tests theo title",
            description = "Tìm kiếm title chứa keyword (case-insensitive). Dùng khi FE muốn tìm kiếm theo từ khoá."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công")
    })
    @GetMapping("/search")
    public ResponseEntity<List<TestResponse>> searchByTitle(
            @Parameter(description = "Từ khóa tìm kiếm trong title", required = true)
            @RequestParam("q") String keyword) {
        List<TestResponse> list = testService.searchTestsByTitle(keyword);
        return ResponseEntity.ok(list);
    }

    @Operation(
            summary = "Cập nhật Test",
            description = "Cập nhật các trường của Test. Gửi TestUpdateRequest (phải có id). Trả về TestResponse sau khi cập nhật."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "Test không tồn tại")
    })
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TestResponse> updateTest(
            @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "TestUpdateRequest JSON, bắt buộc có id. Ví dụ: { \"id\":\"<uuid>\", \"title\":\"Mới\", \"numberOfPeople\":5 }",
                    required = true
            )
            @Valid @RequestBody TestUpdateRequest request) {
        TestResponse updated = testService.updateTest(id, request);
        return ResponseEntity.ok(updated);
    }

    @Operation(
            summary = "Xóa Test theo id",
            description = "Xóa Test theo UUID. Trả về 204 No Content khi xóa thành công, 404 nếu không tìm thấy."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "404", description = "Test không tồn tại")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTest(
            @Parameter(description = "UUID của Test cần xóa", required = true) @PathVariable("id") UUID id) {
        testService.deleteTest(id);
        return ResponseEntity.noContent().build();
    }
    @Operation(
            summary = "Xóa Test theo id",
            description = "Xóa Test theo UUID. Trả về 204 No Content khi xóa thành công, 404 nếu không tìm thấy."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "404", description = "Test không tồn tại")
    })
    @DeleteMapping("/{userId}/by-status")
    public ResponseEntity<Void> deleteAllTestsByUserIdAndStatus(
            @PathVariable UUID userId,
            @RequestParam Status status) {
        testService.deleteAllTestsByUserIdAndStatus(userId, status);
        return ResponseEntity.noContent().build();
    }
}
