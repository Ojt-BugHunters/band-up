package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.authentication.AccountDto;
import com.project.Band_Up.dtos.authentication.AccountDtoResponse;
import com.project.Band_Up.services.authentication.AccountService;
import com.project.Band_Up.utils.JwtUserDetails;
import com.project.Band_Up.utils.JwtUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication API",
    description = "Các endpoint để quản lý authentication (login,logout, register,...)")
public class AuthenticationController {

    @Autowired
    private AccountService accountService;
    @Autowired
    private JwtUtil jwtUtil;
    private final long accessTokenAge;
    private final long refreshTokenAge;

    public AuthenticationController(@Value("${JWT_ACCESSEXPIRATION}") long accessTokenAge,
                                    @Value("${JWT_REFRESHEXPIRATION}") long refreshTokenAge) {
        this.accessTokenAge = accessTokenAge;
        this.refreshTokenAge = refreshTokenAge;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerByEmail(@Valid @RequestBody AccountDto account) {
        AccountDtoResponse accountDtoResponse = accountService.registerByEmail(account);
        JwtUserDetails jwtUserDetails = JwtUserDetails.builder()
                .accountId(accountDtoResponse.getId())
                .role(accountDtoResponse.getRole().toString())
                .build();
        ResponseCookie refreshCookie = ResponseCookie
                .from("RefreshToken", jwtUtil.generateRefreshToken(accountDtoResponse.getId()))
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .maxAge(refreshTokenAge/1000)
                .path("/")
                .build();
        ResponseCookie accessCookie = ResponseCookie
                .from("AccessToken", jwtUtil.generateAccessToken(jwtUserDetails))
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .maxAge(accessTokenAge/1000)
                .path("/")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString(), accessCookie.toString())
                .body(accountDtoResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginByEmail(@Valid @RequestBody AccountDto account) {
        AccountDtoResponse accountDtoResponse = accountService.loginByEmail(account);
        JwtUserDetails jwtUserDetails = JwtUserDetails.builder()
                .accountId(accountDtoResponse.getId())
                .role(accountDtoResponse.getRole().toString())
                .build();
        ResponseCookie refreshCookie = ResponseCookie
                .from("RefreshToken", jwtUtil.generateRefreshToken(accountDtoResponse.getId()))
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .maxAge(refreshTokenAge/1000)
                .path("/")
                .build();
        ResponseCookie accessCookie = ResponseCookie
                .from("AccessToken", jwtUtil.generateAccessToken(jwtUserDetails))
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .maxAge(accessTokenAge/1000)
                .path("/")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString(), accessCookie.toString())
                .body(accountDtoResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(name = "AccessToken") String accessToken,
                                    @CookieValue(name = "RefreshToken") String refreshToken) {
        ResponseCookie refreshCookie = ResponseCookie
                .from("RefreshToken", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .maxAge(0)
                .path("/")
                .build();
        ResponseCookie accessCookie = ResponseCookie
                .from("AccessToken", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .maxAge(0)
                .path("/")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString(), accessCookie.toString())
                .build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(@CookieValue(name = "RefreshToken")
                                                String refreshToken) {
        if(jwtUtil.validateRefreshToken(refreshToken)){
            UUID accountId = jwtUtil.extractAccountIdFromRefresh(refreshToken);
            JwtUserDetails jwtUserDetails = accountService.getAccountDetails(accountId);
            ResponseCookie accessCookie = ResponseCookie
                    .from("AccessToken", jwtUtil.generateAccessToken(jwtUserDetails))
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("None")
                    .maxAge(accessTokenAge/1000)
                    .path("/")
                    .build();
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                    .build();
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}
