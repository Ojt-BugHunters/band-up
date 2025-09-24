package com.project.Band_Up.filters;

import com.project.Band_Up.entities.RefreshToken;
import com.project.Band_Up.repositories.RefreshTokenRepository;
import com.project.Band_Up.utils.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        Cookie[] cookies = request.getCookies();
        String accessToken = null;
        String refreshToken = null;
        UUID accountId = null;
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("AccessToken".equals(cookie.getName())) {
                    accessToken = cookie.getValue();
                } else if ("RefreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                }
            }
        }
        if (accessToken != null) {
            accountId = UUID.fromString(jwtUtil.extractSubject(accessToken));
        } else if (refreshToken != null) {
            accountId = jwtUtil.validateRefreshToken(refreshToken);

            ResponseCookie newAccessToken = jwtUtil.getCookie(jwtUtil.generateAccessToken(accountId), "AccessToken");

            response.addHeader("Set-Cookie", newAccessToken.toString());
        }

        if (accountId != null) {
            Authentication authentication = jwtUtil.getAuthentication(accountId);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request,response);
    }
}
