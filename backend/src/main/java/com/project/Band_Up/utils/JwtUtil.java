package com.project.Band_Up.utils;

import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.RefreshToken;
import com.project.Band_Up.exceptions.AuthenticationFailedException;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
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
    @Autowired
    private UserDetailsService userDetailsService;
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

    public String generateRefreshToken(UUID accountId) {
        String tokenSecret = UUID.randomUUID().toString();

        String hashedSecret = passwordEncoder.encode(tokenSecret);
        RefreshToken refreshToken = refreshTokenRepository.save(RefreshToken.builder()
                .account(getAccount(accountId))
                .token(hashedSecret)
                .expiredAt(new Date(System.currentTimeMillis() + REFRESH_TOKEN_AGE))
                .build());

        String tokenId = refreshToken.getId().toString();
        return tokenId + "." + tokenSecret;
    }

    public UUID validateRefreshToken(String rawToken) {
        String[] parts = rawToken.split("\\.");
        if (parts.length != 2) {
            throw new AuthenticationFailedException("Invalid refresh token format");
        }

        String tokenId = parts[0];
        String tokenSecret = parts[1];

        RefreshToken entity = refreshTokenRepository.findById(UUID.fromString(tokenId))
                .orElseThrow(() -> new AuthenticationFailedException("Refresh token not found"));

        if (entity.getExpiredAt().before(new Date())) {
            throw new AuthenticationFailedException("Refresh token expired");
        }

        if (!passwordEncoder.matches(tokenSecret, entity.getToken())) {
            throw new AuthenticationFailedException("Invalid refresh token");
        }

        return entity.getAccount().getId();
    }


    public void deleteRefreshToken(String refreshToken) {
        String[] parts = refreshToken.split("\\.");
        if (parts.length != 2) {
            throw new AuthenticationFailedException("Invalid refresh token format");
        }

        String tokenId = parts[0];
        String tokenSecret = parts[1];
        if(refreshTokenRepository.existsById(UUID.fromString(tokenId)))
            refreshTokenRepository.deleteById(UUID.fromString(tokenId));
    }

    public Claims validateAccessToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(SECRET_KEY)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new AuthenticationFailedException("Access token expired");
        } catch (JwtException e) {
            throw new AuthenticationFailedException("Invalid access token");
        }
}

    public String extractSubject(String token) {
        return validateAccessToken(token).getSubject();
    }

    public ResponseCookie getCookie(String token, String tokenType) {
        ResponseCookie cookie = ResponseCookie.from(tokenType, token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("None")
                .maxAge(tokenType.equalsIgnoreCase("AccessToken")? 15 * 60 : (int) TimeUnit.DAYS.toSeconds(7)) // 15 minutes
                .build();
        return cookie;
    }
    public ResponseCookie deleteCookie(String tokenType) {
        ResponseCookie cookie = ResponseCookie.from(tokenType, "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("None")
                .maxAge(0) // 15 minutes
                .build();
        return cookie;
    }

    public Account getAccount(UUID id){
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id.toString()));
    }

    public Authentication getAuthentication(UUID accountId) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(accountId.toString());

        return new UsernamePasswordAuthenticationToken(
                userDetails,
                null, // no password required, already authenticated
                userDetails.getAuthorities()
        );
    }
}
