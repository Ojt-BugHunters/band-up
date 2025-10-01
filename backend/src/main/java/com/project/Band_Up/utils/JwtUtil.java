package com.project.Band_Up.utils;

import io.jsonwebtoken.*;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

@AllArgsConstructor
@Builder
public class JwtUtil {

    private final Key accessKey;
    private final Key refreshKey;
    private final long accessExpirationMillis;
    private final long refreshExpirationMillis;

    public String generateAccessToken(JwtUserDetails userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getAccountId().toString())
                .claim("role", userDetails.getRole())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessExpirationMillis))
                .signWith(accessKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateAccessToken(String token) {
        return validateToken(token, accessKey);
    }

    public JwtUserDetails extractUserFromAccess(String token) {
        return extractUserDetails(token, accessKey);
    }

    public String generateRefreshToken(UUID accountId) {
        return Jwts.builder()
                .setSubject(accountId.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpirationMillis))
                .signWith(refreshKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateRefreshToken(String token) {
        return validateToken(token, refreshKey);
    }

    public UUID extractAccountIdFromRefresh(String token) {
        Claims claims = parseClaims(token, refreshKey);
        return UUID.fromString(claims.getSubject());
    }

    private boolean validateToken(String token, Key key) {
        try {
            Jwts.parser().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private JwtUserDetails extractUserDetails(String token, Key key) {
        Claims claims = parseClaims(token, key);
        UUID accountId = UUID.fromString(claims.getSubject());
        String role = claims.get("role", String.class);
        return new JwtUserDetails(accountId, role);
    }

    private Claims parseClaims(String token, Key key) {
        return Jwts.parser().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }
}
