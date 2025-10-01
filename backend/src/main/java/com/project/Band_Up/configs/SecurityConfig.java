package com.project.Band_Up.configs;

import com.project.Band_Up.handlers.Oauth2SuccessHandler;
import com.project.Band_Up.services.authentication.AccountService;
import com.project.Band_Up.services.authentication.FacebookUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${FRONTEND_URL}")
    private String frontendURL;

    @Autowired
    private FacebookUserService facebookUserService;
    @Autowired
    private Oauth2SuccessHandler  oauth2SuccessHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oauth2SuccessHandler)
                        .defaultSuccessUrl(frontendURL, true)
                )
                .logout(logout -> logout
                        .logoutUrl("api/auth/logout")
                        .permitAll()
                        .logoutSuccessUrl(frontendURL)
                        .deleteCookies("AccessCookie", "RefreshCookie", "JSESSIONID")
                );
        return http.build();
    }
}
