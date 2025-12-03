package com.project.Band_Up.configs;

import com.project.Band_Up.utils.JwtUtil;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Configuration
public class JwtConfig {

    private final SecretKey accessKey;
    private final SecretKey refreshKey;
    private final long accessTokenAge;
    private final long refreshTokenAge;

    public JwtConfig(@Value("${JWT_ACCESSKEY}") String accessKey,
                     @Value("${JWT_REFRESHKEY}") String refreshKey,
                     @Value("${JWT_ACCESSEXPIRATION}") long accessTokenAge,
                     @Value("${JWT_REFRESHEXPIRATION}") long refreshTokenAge){
        this.accessKey = Keys.hmacShaKeyFor(accessKey.getBytes(StandardCharsets.UTF_8));
        this.refreshKey = Keys.hmacShaKeyFor(refreshKey.getBytes(StandardCharsets.UTF_8));
        this.accessTokenAge = accessTokenAge;
        this.refreshTokenAge = refreshTokenAge;
    }

    @Bean
    public JwtUtil jwtUtil() {
        return JwtUtil.builder()
                .accessKey(accessKey)
                .refreshKey(refreshKey)
                .accessExpirationMillis(accessTokenAge)
                .refreshExpirationMillis(refreshTokenAge)
                .build();
    }
}
