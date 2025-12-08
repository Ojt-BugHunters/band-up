package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.authentication.AccountDtoResponse;
import com.project.Band_Up.dtos.profile.AvatarCreateRequest;
import com.project.Band_Up.dtos.profile.AvatarDto;
import com.project.Band_Up.dtos.profile.AvtName;
import com.project.Band_Up.dtos.profile.ProfileDto;
import com.project.Band_Up.services.authentication.AccountService;
import com.project.Band_Up.services.profile.ProfileService;
import com.project.Band_Up.utils.JwtUserDetails;
import com.project.Band_Up.utils.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(value = "/api/profile", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Profile API",
        description = "Các endpoint để quản lý Profile (đọc, cập nhật, avatar upload, ...)")
@CrossOrigin
public class ProfileController {

    @Autowired
    private ProfileService profileService;
    @Autowired
    private AccountService accountService;
    @Autowired
    private JwtUtil jwtUtil;

    // -----------------------------
    // Lấy danh sách tài khoản có phân trang
    // -----------------------------
    @GetMapping("/accounts")
    @Operation(summary = "Lấy danh sách tài khoản có phân trang",
            description = "Trả về danh sách tài khoản với phân trang, bao gồm thông tin subscription của từng tài khoản.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "400", description = "Tham số không hợp lệ")
    })
    public ResponseEntity<Page<AccountDtoResponse>> getAccounts(
            @Parameter(description = "Số trang (bắt đầu từ 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Trường sắp xếp", example = "createdAt")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp (ASC hoặc DESC)", example = "DESC")
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<AccountDtoResponse> accounts = accountService.getAccounts(pageable);
        return ResponseEntity.ok(accounts);
    }

    // -----------------------------
    // Cập nhật thông tin cá nhân
    // -----------------------------
    @PostMapping("/update")
    @Operation(summary = "Cập nhật thông tin tài khoản",
            description = "Cập nhật thông tin cá nhân (tên, địa chỉ, ngày sinh, giới tính, số điện thoại, ...)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng")
    })
    public ResponseEntity<ProfileDto> updateProfile(
            @RequestBody ProfileDto profileDto,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        ProfileDto updated = profileService.updateProfile(profileDto, userDetails.getAccountId());
        return ResponseEntity.ok(updated);
    }

    // -----------------------------
    //Lấy thông tin profile hiện tại
    // -----------------------------
    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin profile của người dùng hiện tại",
            description = "Trả về toàn bộ thông tin cá nhân của người dùng đang đăng nhập.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng")
    })
    public ResponseEntity<ProfileDto> getMyProfile(
            @AuthenticationPrincipal JwtUserDetails userDetails) {
        // Reuse updateProfile logic (or bạn có thể tạo hàm riêng getProfileById trong service)
        ProfileDto profile = profileService.updateProfile(
                profileService.updateProfile(
                        profileService.updateProfile(new ProfileDto(), userDetails.getAccountId()), userDetails.getAccountId()),
                userDetails.getAccountId());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{userId}/avt-info")
    @Operation(summary = "Lấy thông tin avatar của user theo userId",
            description = "Trả về thông tin avatar của user theo userId.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng")
    })
    public ResponseEntity<AvtName> getUserAvatarInfo(
            @Parameter(description = "UUID của user", required = true)
            @PathVariable UUID userId) {
        AvtName dto = profileService.getAvatarName(userId);
        return ResponseEntity.ok(dto);
    }

    // -----------------------------
    //Sinh Presigned URL để FE upload avatar
    // -----------------------------
    @PostMapping("/avatar/presign")
    @Operation(summary = "Tạo presigned URL để upload avatar lên S3",
            description = "Sinh ra URL upload tạm thời để FE có thể upload ảnh đại diện trực tiếp lên S3.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sinh URL thành công")
    })
    public ResponseEntity<AvatarDto> createAvatarPresignedUrl(
//            @Parameter(description = "Tên file gốc, ví dụ: avatar.png") @RequestParam String fileName,
//            @Parameter(description = "MIME type, ví dụ: image/png") @RequestParam String contentType,
            @RequestBody @Valid AvatarCreateRequest request,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        AvatarDto dto = profileService.createAvatarPresignedUrl(request, userDetails.getAccountId());
        return ResponseEntity.ok(dto);
    }

    // -----------------------------
    //Lưu avatarKey vào Account sau khi upload xong
    // -----------------------------
    @PostMapping("/avatar/save")
    @Operation(summary = "Lưu avatarKey vào tài khoản",
            description = "Sau khi FE upload xong avatar lên S3, gọi endpoint này để BE lưu key vào DB và trả về CloudFront URL hiển thị.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lưu avatar thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng")
    })
    public ResponseEntity<AvatarDto> saveAvatar(
            @Parameter(description = "S3 object key, ví dụ: avatars/<userId>/avatar-xxxx.png") @RequestParam String key,
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        AvatarDto saved = profileService.saveAvatar(key, userDetails.getAccountId());
        return ResponseEntity.ok(saved);
    }

    // -----------------------------
    //Lấy CloudFront URL của avatar để hiển thị
    // -----------------------------
    @GetMapping("/avatar")
    @Operation(summary = "Lấy avatar hiện tại của user",
            description = "Trả về CloudFront signed URL của avatar hiện tại.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Thành công"),
            @ApiResponse(responseCode = "404", description = "User chưa có avatar")
    })
    public ResponseEntity<AvatarDto> getAvatar(
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        AvatarDto dto = profileService.getAvatar(userDetails.getAccountId());
        return ResponseEntity.ok(dto);
    }

    // -----------------------------
    // Xóa avatar (optional)
    // -----------------------------
    @DeleteMapping("/avatar")
    @Operation(summary = "Xóa avatar hiện tại của user",
            description = "Xóa avatar hiện tại khỏi S3 và cập nhật DB (nếu có).")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy user hoặc avatar")
    })
    public ResponseEntity<Void> deleteAvatar(
            @AuthenticationPrincipal JwtUserDetails userDetails) {
        ProfileDto profile = profileService.updateProfile(new ProfileDto(), userDetails.getAccountId());
        UUID accountId = userDetails.getAccountId();

        // Nếu cần, bạn có thể implement thêm hàm deleteAvatar(accountId) trong ProfileServiceImpl.
        // Ở đây minh họa sẵn đoạn controller stub.
        return ResponseEntity.noContent().build();
    }
}

