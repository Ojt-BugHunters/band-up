package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.profile.ProfileDto;
import com.project.Band_Up.services.profile.ProfileService;
import com.project.Band_Up.utils.JwtUserDetails;
import com.project.Band_Up.utils.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile API",
        description = "Các endpoint để quản lý Profile (read, update, delete ,...)")
public class ProfileController {

    @Autowired
    private ProfileService profileService;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/update")
    @Operation(summary = "Update account profile",
            description = "Update the profile and return the updated profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileDto profileDto,
                                           @AuthenticationPrincipal JwtUserDetails  userDetails) {
        return ResponseEntity.ok()
                .body(profileService.updateProfile(profileDto, userDetails.getAccountId()));
    }
}
