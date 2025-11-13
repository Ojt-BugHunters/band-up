package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.task.TaskResponse;
import com.project.Band_Up.dtos.task.TaskUpdateRequest;
import com.project.Band_Up.services.task.TaskService;
import com.project.Band_Up.utils.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Task API", description = "Quản lý Task của người dùng (Tạo, xem, sửa, xoá, lọc theo ngày)")
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "Tạo task mới")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tạo task thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ")
    })
    @PostMapping("/create")
    public ResponseEntity<TaskResponse> createTask(
            @AuthenticationPrincipal JwtUserDetails userDetails,
            @RequestBody TaskResponse request
    ) {
        TaskResponse response = taskService.createTask(request, userDetails.getAccountId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Lấy tất cả task của user hiện tại")
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(
            @AuthenticationPrincipal JwtUserDetails userDetails
    ) {
        List<TaskResponse> tasks = taskService.getAllTasksByUser(userDetails.getAccountId());
        return ResponseEntity.ok(tasks);
    }

    @Operation(summary = "Lấy tất cả task chưa hoàn thành")
    @GetMapping("/incomplete")
    public ResponseEntity<List<TaskResponse>> getIncompleteTasks(
            @AuthenticationPrincipal JwtUserDetails userDetails
    ) {
        List<TaskResponse> tasks = taskService.getIncompleteTasks(userDetails.getAccountId());
        return ResponseEntity.ok(tasks);
    }

    @Operation(summary = "Lấy tất cả task đã hoàn thành")
    @GetMapping("/completed")
    public ResponseEntity<List<TaskResponse>> getCompletedTasks(
            @AuthenticationPrincipal JwtUserDetails userDetails
    ) {
        List<TaskResponse> tasks = taskService.getCompletedTasks(userDetails.getAccountId());
        return ResponseEntity.ok(tasks);
    }

    @Operation(summary = "Lấy tất cả task trong ngày hôm nay")
    @GetMapping("/today")
    public ResponseEntity<List<TaskResponse>> getTodayTasks(
            @AuthenticationPrincipal JwtUserDetails userDetails
    ) {
        List<TaskResponse> tasks = taskService.getTodayTasks(userDetails.getAccountId());
        return ResponseEntity.ok(tasks);
    }

    @Operation(summary = "Lấy tất cả task theo ngày bất kỳ")
    @GetMapping("/by-date")
    public ResponseEntity<List<TaskResponse>> getTasksByDate(
            @AuthenticationPrincipal JwtUserDetails userDetails,
            @Parameter(description = "Ngày muốn lấy task, định dạng yyyy-MM-dd")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<TaskResponse> tasks = taskService.getTasksByDate(userDetails.getAccountId(), date);
        return ResponseEntity.ok(tasks);
    }

    @Operation(summary = "Cập nhật thông tin task")
    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable UUID taskId,
            @RequestBody TaskUpdateRequest request,
            @AuthenticationPrincipal JwtUserDetails userDetails
    ) {
        TaskResponse updated = taskService.updateTask(taskId, request, userDetails.getAccountId());
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Chuyển trạng thái hoàn thành / chưa hoàn thành cho task")
    @PatchMapping("/{taskId}/toggle")
    public ResponseEntity<TaskResponse> toggleTaskCompletion(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal JwtUserDetails userDetails
    ) {
        TaskResponse updated = taskService.toggleTaskCompletion(taskId, userDetails.getAccountId());
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Xoá task")
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable UUID taskId,
            @AuthenticationPrincipal JwtUserDetails userDetails
    ) {
        taskService.deleteTask(taskId, userDetails.getAccountId());
        return ResponseEntity.noContent().build();
    }
}
