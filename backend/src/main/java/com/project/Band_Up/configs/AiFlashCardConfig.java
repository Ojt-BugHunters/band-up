package com.project.Band_Up.configs;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class AiFlashCardConfig {

    @Value("${ai.flashcard.api.url}")
    private String apiUrl;

    @Value("${api.key}")
    private String apiKey;
}