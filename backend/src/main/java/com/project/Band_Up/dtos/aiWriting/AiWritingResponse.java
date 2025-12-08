package com.project.Band_Up.dtos.aiWriting;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AiWritingResponse {

    @JsonProperty("session_id")
    private UUID sessionId;

    @JsonProperty("overall_band")
    private Double overallBand;

    @JsonProperty("task_achievement_band")
    private Double taskAchievementBand;

    @JsonProperty("coherence_band")
    private Double coherenceBand;

    @JsonProperty("lexical_band")
    private Double lexicalBand;

    @JsonProperty("grammar_band")
    private Double grammarBand;

    private Feedback feedback;

    @JsonProperty("confidence_score")
    private Double confidenceScore;

    @JsonProperty("model_used")
    private String modelUsed;

    @JsonProperty("word_count")
    private Integer wordCount;

    private Double cost;

    @JsonProperty("evaluated_at")
    private Long evaluatedAt;
}
