package com.project.Band_Up.configs;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class AiSpeakingConfig {
    @Value("${ai.speaking.api.url}")
    private String apiUrl;

    @Value("${api.key}")
    private String apiKey;
}
