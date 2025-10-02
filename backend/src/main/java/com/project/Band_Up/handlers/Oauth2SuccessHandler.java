package com.project.Band_Up.handlers;

import com.project.Band_Up.entities.Account;
import com.project.Band_Up.enums.Gender;
import com.project.Band_Up.enums.Role;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.utils.JwtUserDetails;
import com.project.Band_Up.utils.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.sql.Date;
import java.time.LocalDate;

@Component
public class Oauth2SuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Value("${JWT_ACCESSEXPIRATION}")
    private long accessTokenAge;
    @Value("${JWT_REFRESHEXPIRATION}")
    private long refreshTokenAge;
    @Value("${FRONTEND_URL}")
    private String frontendURL;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        boolean isFirstTime = false;
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("OAuth2 provider did not return an email address");
        }

        Account account = accountRepository.findByEmail(email);

        if (account != null) {
            if (name != null) account.setName(name);

            account = accountRepository.save(account);
        } else {
            account = Account.builder()
                    .email(email)
                    .name(name != null ? name : "Anonymous User")
                    .isActive(true)
                    .role(Role.Member)
                    .build();

            account = accountRepository.save(account);
            isFirstTime = true;
        }
        JwtUserDetails jwtUserDetails = JwtUserDetails.builder()
                .role(account.getRole().toString())
                .accountId(account.getId())
                .build();
        ResponseCookie refreshCookie = ResponseCookie
                .from("RefreshToken", jwtUtil.generateRefreshToken(account.getId()))
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

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        if(isFirstTime){
            response.sendRedirect(frontendURL+"/auth/register/profile");
        } else
            response.sendRedirect(frontendURL);
    }
}
