package com.project.Band_Up.dtos.aiSpeaking;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AiSpeakingRequest {
    @JsonProperty("session_id")
    private UUID sessionId;

    @JsonProperty("user_id")
    private UUID userId;

    @JsonProperty("audio_url")
    private String audioUrl;

    @JsonProperty("task_type")
    private String taskType;

    @JsonProperty("prompt")
    private String prompt;

    @JsonProperty("duration_seconds")
    private Integer durationSeconds;
}
