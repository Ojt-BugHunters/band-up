package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.authentication.AccountDto;
import com.project.Band_Up.dtos.authentication.AccountDtoResponse;
import com.project.Band_Up.services.authentication.AccountService;
import com.project.Band_Up.utils.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication API",
    description = "Các endpoint để quản lý authentication (login,logout, register,...)")
public class AuthenticationController {

    @Autowired
    private AccountService accountService;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    @Operation(summary = "Register a new account by email", description = "Creates a new user account and returns account details with JWT cookie.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully registered"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "409", description = "Email already exists")
    })
    public ResponseEntity<?> registerByEmail(@Valid @RequestBody AccountDto account) {
        AccountDtoResponse accountDtoResponse = accountService.registerByEmail(account);
        ResponseCookie refreshToken = jwtUtil.getRefreshTokenCookie(accountDtoResponse.getId());
        ResponseCookie accessToken = jwtUtil.getAccessTokenCookie(accountDtoResponse.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessToken.toString())
                .header(HttpHeaders.SET_COOKIE, refreshToken.toString())
                .body(accountDtoResponse);
    }

    @PostMapping("/login")
    @Operation(summary = "Login by email", description = "Authenticates user and returns account details with JWT cookie.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully logged in"),
            @ApiResponse(responseCode = "400", description = "Invalid credentials"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    public ResponseEntity<?> loginByEmail(@Valid @RequestBody AccountDto account) {
        AccountDtoResponse accountDtoResponse = accountService.loginByEmail(account);
        ResponseCookie refreshToken = jwtUtil.getRefreshTokenCookie(accountDtoResponse.getId());
        ResponseCookie accessToken = jwtUtil.getAccessTokenCookie(accountDtoResponse.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessToken.toString())
                .header(HttpHeaders.SET_COOKIE, refreshToken.toString())
                .body(accountDtoResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(name = "RefreshToken", required = false) String refreshToken,
                                   @CookieValue(name = "AccessToken", required = false) String accessToken) {
        jwtUtil.deleteRefreshToken(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtUtil.deleteRefreshTokenCookie().toString())
                .header(HttpHeaders.SET_COOKIE, jwtUtil.deleteAccessTokenCookie().toString())
                .build();
    }
}
