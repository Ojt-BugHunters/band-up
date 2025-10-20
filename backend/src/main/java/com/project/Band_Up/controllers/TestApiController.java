package com.project.Band_Up.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Health API", description = "Endpoint kiểm tra trạng thái service")
public class TestApiController {

    @Operation(summary = "Health check", description = "Trả về 200 OK nếu service chạy bình thường")
    @GetMapping("/api/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}
