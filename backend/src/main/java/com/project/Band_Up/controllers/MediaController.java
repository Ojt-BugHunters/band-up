package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.media.MediaCreateRequest;
import com.project.Band_Up.dtos.media.MediaRequest;
import com.project.Band_Up.dtos.media.MediaResponse;
import com.project.Band_Up.services.media.MediaService;
import com.project.Band_Up.utils.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(value = "/api/media", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "MEDIA API", description = "Các endpoint để quản lý upload, lưu và lấy media từ S3/CloudFront.")
@RequiredArgsConstructor
@Validated
@CrossOrigin
public class MediaController {

    private final MediaService mediaService;
    private final JwtUtil jwtUtil;

    // -------------------------------------------------------
    // 1️⃣ Tạo Presigned URL để FE upload trực tiếp lên S3
    // -------------------------------------------------------
    @Operation(
            summary = "Tạo presigned URL để upload file lên S3",
            description = """
                    FE gửi thông tin file (entityType, entityId, fileName, contentType).  
                    BE sẽ sinh presigned URL có thời hạn (mặc định 10 phút) để FE upload trực tiếp lên S3.  
                    Trả về `MediaResponse` gồm `key`, `cloudFrontUrl` (ở đây là presigned upload URL), và `expiresAt`.
                    """,
            requestBody = @RequestBody(
                    required = true,
                    description = "MediaRequest JSON, ví dụ: { \"entityType\": \"section\", \"entityId\": \"uuid\", \"fileName\": \"photo.png\", \"contentType\": \"image/png\" }",
                    content = @Content(schema = @Schema(implementation = MediaRequest.class))
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tạo presigned URL thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ")
    })
    @PostMapping(value = "/presign", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MediaResponse> createPresignedUploadUrl(
            @Valid @RequestBody MediaRequest request) {
        MediaResponse response = mediaService.createPresignedUploadUrl(request);
        return ResponseEntity.ok(response);
    }

    // -------------------------------------------------------
    // 2️⃣ Lưu bản ghi Media sau khi FE upload thành công
    // -------------------------------------------------------
    @Operation(
            summary = "Lưu thông tin file đã upload vào database",
            description = """
                    Sau khi FE upload thành công file lên S3, FE gọi API này để BE lưu bản ghi media.  
                    BE sẽ gắn file đó vào Section hoặc Question tương ứng.  
                    Trả về `MediaResponse` gồm CloudFront signed URL để FE có thể hiển thị ngay.
                    """,
            requestBody = @RequestBody(
                    required = true,
                    description = "MediaCreateRequest JSON, ví dụ: { \"key\": \"sections/uuid/abc123-photo.png\", \"type\": \"section\", \"entityId\": \"uuid\" }",
                    content = @Content(schema = @Schema(implementation = MediaCreateRequest.class))
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Lưu media thành công"),
            @ApiResponse(responseCode = "400", description = "Yêu cầu không hợp lệ"),
            @ApiResponse(responseCode = "404", description = "Section hoặc Question không tồn tại")
    })
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MediaResponse> saveMediaRecord(
            @Valid @RequestBody MediaCreateRequest request) {
        MediaResponse response = mediaService.saveMediaRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // -------------------------------------------------------
    // 3️⃣ Lấy CloudFront signed URL để FE hiển thị file (ảnh/video)
    // -------------------------------------------------------
    @Operation(
            summary = "Tạo CloudFront signed URL để truy cập file đã upload",
            description = """
                    FE gọi API này với key (đường dẫn trong S3).  
                    BE sẽ kiểm tra file có tồn tại hay không, sau đó ký CloudFront URL có thời hạn (mặc định 24h).  
                    Trả về `MediaResponse` gồm `key`, `cloudFrontUrl`, và `expiresAt`.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ký URL thành công"),
            @ApiResponse(responseCode = "404", description = "File không tồn tại trong S3")
    })
    @GetMapping("/signed-url")
    public ResponseEntity<MediaResponse> getSignedUrl(
            @Parameter(description = "Key của file trong S3, ví dụ: sections/uuid/photo.png", required = true)
            @RequestParam("key") String key) {
        MediaResponse response = mediaService.createCloudFrontSignedUrl(key);
        return ResponseEntity.ok(response);
    }
}
