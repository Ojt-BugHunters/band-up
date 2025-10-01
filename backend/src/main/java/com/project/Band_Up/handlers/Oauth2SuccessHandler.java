package com.project.Band_Up.handlers;

import com.project.Band_Up.entities.Account;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.utils.JwtUserDetails;
import com.project.Band_Up.utils.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

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
        Account account = Account.builder()
                .email(oAuth2User.getAttribute("email"))
                .name(oAuth2User.getAttribute("name"))
                .birthday(oAuth2User.getAttribute("birthday"))
                .gender(oAuth2User.getAttribute("gender"))
                .build();
        Account existingAccount = accountRepository.findByEmail(oAuth2User.getAttribute("email"));
        if(existingAccount != null) {
            existingAccount.setName(account.getName());
            existingAccount.setGender(account.getGender());
            existingAccount.setBirthday(account.getBirthday());
            account = accountRepository.save(existingAccount);
        } else account = accountRepository.save(account);
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

        response.addHeader("Set-Cookie", refreshCookie.toString());
        response.addHeader("Set-Cookie", accessCookie.toString());
    }
}
