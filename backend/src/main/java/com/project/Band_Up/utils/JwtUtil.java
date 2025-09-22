package com.project.Band_Up.utils;

import com.project.Band_Up.dtos.authentication.AccountDto;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AccountRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Component
public class JwtUtil {

    private static AccountRepository accountRepository;
    private static SecretKey secretKey;
    private final static long tokenAge = 30L * 24 * 60 * 60 * 1000; // 30 days

    public JwtUtil(AccountRepository accountRepository,
                   @Value("${jwt.secret}") String jwtSecret) {
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
    public static String generateToken(AccountDto account) {
        return Jwts.builder()
                .subject(account.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + tokenAge))
                .signWith(secretKey)
                .compact();
    }

    public static String extractBody(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public static Account getAccount(String email) {
        Account account = accountRepository.findFirstByEmail(email);
        if (account == null) throw new ResourceNotFoundException(email);
        return account;
    }

    public static ResponseCookie getCookie(String token) {
        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Strict")
                .maxAge((int) TimeUnit.DAYS.toSeconds(7)) // 7 days
                .build();
        return cookie;
    }
}
