package com.project.Band_Up.controllers;

import com.project.Band_Up.services.crawTest.CrawReadingTestService;
import com.project.Band_Up.services.crawTest.CrawListeningTestService;
import com.project.Band_Up.services.crawTest.CrawSpeakingTestService;
import com.project.Band_Up.services.crawTest.CrawWritingTestService;
import com.project.Band_Up.utils.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/admin/craw-tests", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Craw Test API", description = "API dành cho Admin để import Reading và Listening tests từ file JSON đã crawl")
@RequiredArgsConstructor
public class CrawTestController {

    private final CrawReadingTestService crawReadingTestService;
    private final CrawListeningTestService crawListeningTestService;
    private final CrawSpeakingTestService crawSpeakingTestService;
    private final CrawWritingTestService crawWritingTestService;

    // ============ READING TEST ENDPOINTS ============

    @Operation(
            summary = "Import tất cả Reading tests từ folder",
            description = "Import tất cả file JSON IELTS Reading tests từ folder được cấu hình. " +
                    "Chỉ Admin mới có quyền thực hiện. Trả về danh sách kết quả import cho từng file."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Import thành công (có thể có file lỗi)"),
            @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
            @ApiResponse(responseCode = "403", description = "Không có quyền Admin"),
            @ApiResponse(responseCode = "500", description = "Lỗi server khi đọc folder hoặc xử lý file")
    })
    @PostMapping("/reading/import-all")
    public ResponseEntity<ImportResponse> importAllReadingTests(
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        List<String> results = crawReadingTestService.importAllTests(userDetails.getAccountId());

        long successCount = results.stream().filter(r -> r.startsWith("✓")).count();
        long failCount = results.stream().filter(r -> r.startsWith("✗")).count();

        ImportResponse response = ImportResponse.builder()
                .success(true)
                .message(String.format("Reading import completed: %d succeeded, %d failed", successCount, failCount))
                .totalFiles(results.size())
                .successCount((int) successCount)
                .failCount((int) failCount)
                .details(results)
                .build();

        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Import một Reading test theo số thứ tự",
            description = "Import file JSON IELTS Reading test theo số thứ tự test (01, 02, 03, 105, v.v.). " +
                    "File phải tồn tại trong folder với định dạng: parsed_ielts-reading-practice-test-{testNumber}-with-answers.json"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Import thành công"),
            @ApiResponse(responseCode = "400", description = "File không tồn tại hoặc lỗi khi import"),
            @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
            @ApiResponse(responseCode = "403", description = "Không có quyền Admin")
    })
    @PostMapping("/reading/import/{testNumber}")
    public ResponseEntity<ImportResponse> importSingleReadingTest(
            @Parameter(description = "Số thứ tự Reading test (VD: 01, 02, 105)", required = true)
            @PathVariable String testNumber,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        try {
            String fileName = String.format("parsed_ielts-reading-practice-test-%s-with-answers.json", testNumber);
            java.io.File file = new java.io.File(
                    "D:\\Crawling-test\\band-up-feature-crawling\\crawler\\web_scraping\\parsed_enhanced\\reading\\practice\\" + fileName
            );

            if (!file.exists()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        ImportResponse.builder()
                                .success(false)
                                .message("Reading file not found: " + fileName)
                                .totalFiles(1)
                                .successCount(0)
                                .failCount(1)
                                .build()
                );
            }

            String result = crawReadingTestService.importSingleTest(file, userDetails.getAccountId());

            ImportResponse response = ImportResponse.builder()
                    .success(true)
                    .message(result)
                    .totalFiles(1)
                    .successCount(1)
                    .failCount(0)
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            ImportResponse response = ImportResponse.builder()
                    .success(false)
                    .message("Reading import failed: " + e.getMessage())
                    .totalFiles(1)
                    .successCount(0)
                    .failCount(1)
                    .build();

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @Operation(
            summary = "Import nhiều Reading tests theo danh sách số thứ tự",
            description = "Import nhiều file JSON IELTS Reading tests theo danh sách số thứ tự. " +
                    "Ví dụ: testNumbers=[\"01\", \"02\", \"03\", \"105\"]"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Import hoàn tất (có thể có file lỗi)"),
            @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
            @ApiResponse(responseCode = "403", description = "Không có quyền Admin")
    })
    @PostMapping("/reading/import-batch")
    public ResponseEntity<ImportResponse> importBatchReadingTests(
            @Parameter(description = "Danh sách số thứ tự Reading tests cần import", required = true)
            @RequestParam List<String> testNumbers,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        List<String> results = crawReadingTestService.importBatchTests(testNumbers, userDetails.getAccountId());

        long successCount = results.stream().filter(r -> r.startsWith("✓")).count();
        long failCount = results.stream().filter(r -> r.startsWith("✗")).count();

        ImportResponse response = ImportResponse.builder()
                .success(true)
                .message(String.format("Reading batch import completed: %d succeeded, %d failed", successCount, failCount))
                .totalFiles(results.size())
                .successCount((int) successCount)
                .failCount((int) failCount)
                .details(results)
                .build();

        return ResponseEntity.ok(response);
    }

    // ============ LISTENING TEST ENDPOINTS ============

    @Operation(
            summary = "Import tất cả Listening tests từ folder",
            description = "Import tất cả file JSON IELTS Listening tests từ folder được cấu hình. " +
                    "Chỉ Admin mới có quyền thực hiện. Trả về danh sách kết quả import cho từng file."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Import thành công (có thể có file lỗi)"),
            @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
            @ApiResponse(responseCode = "403", description = "Không có quyền Admin"),
            @ApiResponse(responseCode = "500", description = "Lỗi server khi đọc folder hoặc xử lý file")
    })
    @PostMapping("/listening/import-all")
    public ResponseEntity<ImportResponse> importAllListeningTests(
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        List<String> results = crawListeningTestService.importAllTests(userDetails.getAccountId());

        long successCount = results.stream().filter(r -> r.startsWith("✓")).count();
        long failCount = results.stream().filter(r -> r.startsWith("✗")).count();

        ImportResponse response = ImportResponse.builder()
                .success(true)
                .message(String.format("Listening import completed: %d succeeded, %d failed", successCount, failCount))
                .totalFiles(results.size())
                .successCount((int) successCount)
                .failCount((int) failCount)
                .details(results)
                .build();

        return ResponseEntity.ok(response);
    }

//    @Operation(
//            summary = "Import một Listening test theo số thứ tự",
//            description = "Import file JSON IELTS Listening test theo số thứ tự test (01, 02, 03, v.v.). " +
//                    "File phải tồn tại trong folder với định dạng: listening_test_{testNumber}.json"
//    )
//    @ApiResponses({
//            @ApiResponse(responseCode = "200", description = "Import thành công"),
//            @ApiResponse(responseCode = "400", description = "File không tồn tại hoặc lỗi khi import"),
//            @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
//            @ApiResponse(responseCode = "403", description = "Không có quyền Admin")
//    })
//    @PostMapping("/listening/import/{testNumber}")
//    public ResponseEntity<ImportResponse> importSingleListeningTest(
//            @Parameter(description = "Số thứ tự Listening test (VD: 01, 02, 03)", required = true)
//            @PathVariable String testNumber,
//            @AuthenticationPrincipal JwtUserDetails userDetails) {
//
//        try {
//            String fileName = String.format("listening_test_%s.json", testNumber);
//            String folderPath = crawListeningTestService.getListeningFolderPath();
//            java.io.File file = new java.io.File(folderPath + java.io.File.separator + fileName);
//
//            if (!file.exists()) {
//                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
//                        ImportResponse.builder()
//                                .success(false)
//                                .message("Listening file not found: " + fileName)
//                                .totalFiles(1)
//                                .successCount(0)
//                                .failCount(1)
//                                .build()
//                );
//            }
//
//            String result = crawListeningTestService.importSingleTest(file, userDetails.getAccountId());
//
//            ImportResponse response = ImportResponse.builder()
//                    .success(true)
//                    .message(result)
//                    .totalFiles(1)
//                    .successCount(1)
//                    .failCount(0)
//                    .build();
//
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            ImportResponse response = ImportResponse.builder()
//                    .success(false)
//                    .message("Listening import failed: " + e.getMessage())
//                    .totalFiles(1)
//                    .successCount(0)
//                    .failCount(1)
//                    .build();
//
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//        }
//    }

    @Operation(
            summary = "Import nhiều Listening tests theo danh sách số thứ tự",
            description = "Import nhiều file JSON IELTS Listening tests theo danh sách số thứ tự. " +
                    "Ví dụ: testNumbers=[\"01\", \"02\", \"03\"]"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Import hoàn tất (có thể có file lỗi)"),
            @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
            @ApiResponse(responseCode = "403", description = "Không có quyền Admin")
    })
    @PostMapping("/listening/import-batch")
    public ResponseEntity<ImportResponse> importBatchListeningTests(
            @Parameter(description = "Danh sách số thứ tự Listening tests cần import", required = true)
            @RequestParam List<String> testNumbers,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        List<String> results = crawListeningTestService.importBatchTests(testNumbers, userDetails.getAccountId());

        long successCount = results.stream().filter(r -> r.startsWith("✓")).count();
        long failCount = results.stream().filter(r -> r.startsWith("✗")).count();

        ImportResponse response = ImportResponse.builder()
                .success(true)
                .message(String.format("Listening batch import completed: %d succeeded, %d failed", successCount, failCount))
                .totalFiles(results.size())
                .successCount((int) successCount)
                .failCount((int) failCount)
                .details(results)
                .build();

        return ResponseEntity.ok(response);
    }
    @PostMapping("/speaking/import-all")
    public ResponseEntity<ImportResponse> importAllSpeakingTests(
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        List<String> results = crawSpeakingTestService.importAllSpeakingTests(userDetails.getAccountId());

        long successCount = results.stream().filter(r -> r.startsWith("✓")).count();
        long failCount = results.stream().filter(r -> r.startsWith("✗")).count();

        ImportResponse response = ImportResponse.builder()
                .success(true)
                .message(String.format("Speaking import completed: %d succeeded, %d failed", successCount, failCount))
                .totalFiles(results.size())
                .successCount((int) successCount)
                .failCount((int) failCount)
                .details(results)
                .build();

        return ResponseEntity.ok(response);
    }
    @Operation(
            summary = "Import tất cả Writing tests từ folder",
            description = "Import tất cả file JSON IELTS Writing tests từ folder được cấu hình. " +
                    "Chỉ Admin mới có quyền thực hiện. Trả về danh sách kết quả import cho từng file."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Import thành công (có thể có file lỗi)"),
            @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
            @ApiResponse(responseCode = "403", description = "Không có quyền Admin"),
            @ApiResponse(responseCode = "500", description = "Lỗi server khi đọc folder hoặc xử lý file")
    })
    @PostMapping("/writing/import-all")
    public ResponseEntity<ImportResponse> importAllWritingTests(
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        List<String> results = crawWritingTestService.importAllWritingTests(userDetails.getAccountId());

        long successCount = results.stream().filter(r -> r.startsWith("✓")).count();
        long failCount = results.stream().filter(r -> r.startsWith("✗")).count();

        ImportResponse response = ImportResponse.builder()
                .success(true)
                .message(String.format("Writing import completed: %d succeeded, %d failed", successCount, failCount))
                .totalFiles(results.size())
                .successCount((int) successCount)
                .failCount((int) failCount)
                .details(results)
                .build();

        return ResponseEntity.ok(response);
    }
    /**
     * DTO cho response của import
     */
    @Data
    @Builder
    public static class ImportResponse {
        private boolean success;
        private String message;
        private Integer totalFiles;
        private Integer successCount;
        private Integer failCount;
        private List<String> details;
    }
}