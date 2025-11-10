package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.room.RoomCreateRequest;
import com.project.Band_Up.dtos.room.RoomResponse;
import com.project.Band_Up.services.room.RoomService;
import com.project.Band_Up.utils.JwtUserDetails;
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
@RequestMapping(value = "/api/rooms", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Room API", description = "Các endpoint để quản lý Room (tạo, tham gia, rời phòng, cập nhật, xóa, v.v.).")
@RequiredArgsConstructor
@Validated
@CrossOrigin
public class RoomController {
    private final RoomService roomService;

    // ======================= CREATE =========================
    @Operation(summary = "Tạo Room mới", description = "Tạo một phòng mới. Người tạo sẽ tự động trở thành Host.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tạo phòng thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ")
    })
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<RoomResponse> createRoom(
            @Valid @RequestBody RoomCreateRequest request,
            @AuthenticationPrincipal JwtUserDetails userDetails) {
System.out.println(request);
        RoomResponse created = roomService.createRoom(userDetails.getAccountId(), request);
        URI location = URI.create("/api/rooms/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    // ======================= GET BY ID =========================
    @Operation(summary = "Lấy Room theo ID", description = "Trả về thông tin chi tiết một Room.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy Room")
    })
    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoomById(
            @Parameter(description = "UUID của Room", required = true)
            @PathVariable UUID roomId) {
        return ResponseEntity.ok(roomService.getRoomById(roomId));
    }

    // ======================= GET BY CODE =========================
    @Operation(summary = "Lấy Room theo roomCode", description = "Tìm kiếm phòng bằng mã roomCode (dùng khi user nhập mã để join).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tìm thấy Room"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy Room")
    })
    @GetMapping("/code/{roomCode}")
    public ResponseEntity<RoomResponse> getRoomByCode(
            @Parameter(description = "Mã roomCode của phòng", required = true)
            @PathVariable String roomCode) {
        return ResponseEntity.ok(roomService.getRoomByCode(roomCode));
    }

    // ======================= GET PUBLIC ROOMS =========================
    @Operation(summary = "Danh sách tất cả phòng public", description = "Trả về danh sách các phòng có isPrivate = false.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công")
    })
    @GetMapping("/public")
    public ResponseEntity<List<RoomResponse>> getAllPublicRooms() {
        return ResponseEntity.ok(roomService.getAllPublicRooms());
    }

    // ======================= JOIN ROOM =========================
    @Operation(summary = "Tham gia Room", description = "User hiện tại (từ token) tham gia vào phòng theo roomId.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tham gia thành công"),
            @ApiResponse(responseCode = "400", description = "Đã là thành viên hoặc phòng private")
    })
    @PostMapping("/{roomId}/join")
    public ResponseEntity<RoomResponse> joinRoom(
            @Parameter(description = "UUID của Room", required = true)
            @PathVariable UUID roomId,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        RoomResponse response = roomService.addMemberToRoom(roomId, userDetails.getAccountId());
        return ResponseEntity.ok(response);
    }

    // ======================= LEAVE ROOM =========================
    @Operation(summary = "Rời khỏi Room", description = "User hiện tại rời phòng. Nếu là host, hệ thống tự chuyển host cho người vào sớm nhất.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rời phòng thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy Room hoặc User")
    })
    @PostMapping("/{roomId}/leave")
    public ResponseEntity<?> leaveRoom(
            @Parameter(description = "UUID của Room", required = true)
            @PathVariable UUID roomId,
            @AuthenticationPrincipal JwtUserDetails userDetails) {


        RoomResponse response = roomService.leaveRoom(roomId, userDetails.getAccountId());
        if (response == null) {
            return ResponseEntity.ok().body("Room deleted because no members remain");
        }
        return ResponseEntity.ok(response);
    }

    // ======================= REMOVE MEMBER =========================
    @Operation(summary = "Host xóa thành viên khỏi Room", description = "Chỉ Host có quyền xóa thành viên khác trong phòng.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "403", description = "Không có quyền (không phải Host)")
    })
    @DeleteMapping("/{roomId}/members/{targetUserId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID roomId,
            @PathVariable UUID targetUserId,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        roomService.removeMemberFromRoom(userDetails.getAccountId(), roomId, targetUserId);
        return ResponseEntity.noContent().build();
    }

    // ======================= TRANSFER HOST =========================
    @Operation(summary = "Host chuyển quyền chủ phòng", description = "Host hiện tại chuyển quyền chủ phòng cho người khác.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Chuyển quyền thành công"),
            @ApiResponse(responseCode = "403", description = "Không có quyền (không phải Host)"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy Room hoặc User")
    })
    @PostMapping("/{roomId}/transfer-host/{newHostId}")
    public ResponseEntity<Void> transferHost(
            @PathVariable UUID roomId,
            @PathVariable UUID newHostId,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        roomService.transferHost(userDetails.getAccountId(), roomId, newHostId);
        return ResponseEntity.ok().build();
    }

    // ======================= UPDATE ROOM =========================
    @Operation(summary = "Cập nhật Room", description = "Host có thể cập nhật tên hoặc mô tả phòng.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "403", description = "Không có quyền cập nhật"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy Room")
    })
    @PutMapping("/{roomId}")
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable UUID roomId,
            @Valid @RequestBody RoomCreateRequest request) {
        RoomResponse updated = roomService.updateRoom(roomId, request);
        return ResponseEntity.ok(updated);
    }

    // ======================= DELETE ROOM =========================
    @Operation(summary = "Xóa Room", description = "Chỉ Host có thể xóa phòng. Khi xóa sẽ xóa luôn tất cả thành viên.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "403", description = "Không có quyền xóa (không phải Host)"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy Room")
    })
    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal JwtUserDetails userDetails) {
        roomService.deleteRoom(userDetails.getAccountId(), roomId);
        return ResponseEntity.noContent().build();
    }
    @Operation(summary = "Kiểm tra User có đang trong room nào không", description = "Kiểm tra xem User có tồn tại hay không dựa trên UserId.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy User")
    })
    @GetMapping("/check-user-in-room")
    public ResponseEntity<List<RoomResponse>> checkUserInRoom(
            @AuthenticationPrincipal JwtUserDetails userDetails) {
        List<RoomResponse> response  = roomService.isUserInRoom(userDetails.getAccountId());
        return ResponseEntity.ok(response);
    }
}
