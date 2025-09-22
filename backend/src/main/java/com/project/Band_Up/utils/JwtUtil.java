package com.project.Band_Up.utils;

import com.project.Band_Up.dtos.authentication.AccountDto;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.RefreshToken;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.RefreshTokenRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Component
public class JwtUtil {
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    private SecretKey SECRET_KEY;
    @Autowired
    private PasswordEncoder passwordEncoder;
    private final long ACCESS_TOKEN_AGE = 15 * 60 * 1000;   // 15 minutes
    private final long REFRESH_TOKEN_AGE = 30L * 24 * 60 * 60 * 1000; // 30 days

    public JwtUtil(@Value("${jwt.secret}") String jwtSecret) {
        SECRET_KEY = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
    public String generateAccessToken(UUID id) {
        return Jwts.builder()
                .subject(id.toString())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_AGE))
                .signWith(SECRET_KEY)
                .compact();
    }

    public String generateRefreshToken(UUID id) {
        Account account =  getAccount(id);
        String rawToken = UUID.randomUUID().toString();
        String hashedToken = passwordEncoder.encode(rawToken);
        refreshTokenRepository.save(RefreshToken.builder()
                .account(modelMapper.map(account, Account.class))
                .token(hashedToken)
                .expiredAt(new Date(System.currentTimeMillis() + REFRESH_TOKEN_AGE))
                .build());
        return rawToken;
    }

    public String extractBody(String token) {
        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public ResponseCookie getAccessTokenCookie(UUID id) {
        String token = generateAccessToken(id);
        ResponseCookie cookie = ResponseCookie.from("AccessToken", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Strict")
                .maxAge(15 * 60) // 15 minutes
                .build();
        return cookie;
    }
    public ResponseCookie getRefreshTokenCookie(UUID id) {
        String token = generateRefreshToken(id);
        ResponseCookie cookie = ResponseCookie.from("RefreshToken", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Strict")
                .maxAge((int) TimeUnit.DAYS.toSeconds(7)) // 7 days
                .build();
        return cookie;
    }

    public Account getAccount(UUID id){
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id.toString()));
    }
}
