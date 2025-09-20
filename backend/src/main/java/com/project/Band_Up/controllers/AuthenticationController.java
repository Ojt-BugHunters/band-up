package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.authentication.AccountDto;
import com.project.Band_Up.dtos.authentication.AccountDtoResponse;
import com.project.Band_Up.services.authentication.AccountService;
import com.project.Band_Up.utils.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    private AccountService accountService;

    @PostMapping("/register")
    public ResponseEntity<?> registerByEmail(@Valid @RequestBody AccountDto account) {
        AccountDtoResponse accountDtoResponse = accountService.registerByEmail(account);
        ResponseCookie responseCookie = JwtUtil.getCookie(accountDtoResponse.getEmail());
        return ResponseEntity.ok()
                .header("Cookie", responseCookie.toString())
                .build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginByEmail(@Valid @RequestBody AccountDto account) {
        AccountDtoResponse accountDtoResponse = accountService.loginByEmail(account);
        ResponseCookie responseCookie = JwtUtil.getCookie(accountDtoResponse.getEmail());
        return ResponseEntity.ok()
                .header("Cookie", responseCookie.toString())
                .build();
    }
}
