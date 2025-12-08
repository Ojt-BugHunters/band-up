package com.project.Band_Up.dtos.aiSpeaking;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AiSpeakingResponse {

    @JsonProperty("session_id")
    private String sessionId;

    @JsonProperty("transcript")
    private String transcript;

    @JsonProperty("duration")
    private Integer duration;

    @JsonProperty("word_count")
    private Integer wordCount;

    @JsonProperty("overall_band")
    private Double overallBand;

    @JsonProperty("fluency_band")
    private Double fluencyBand;

    @JsonProperty("lexical_band")
    private Double lexicalBand;

    @JsonProperty("grammar_band")
    private Double grammarBand;

    @JsonProperty("pronunciation_band")
    private Double pronunciationBand;

    @JsonProperty("feedback")
    private Feedback feedback;

    @JsonProperty("confidence_score")
    private Double confidenceScore;

    @JsonProperty("model_used")
    private String modelUsed;

    @JsonProperty("model_version")
    private String modelVersion;

    @JsonProperty("fallback_occurred")
    private Boolean fallbackOccurred;

    @JsonProperty("estimated_cost")
    private Double estimatedCost;

    @JsonProperty("token_usage")
    private TokenUsage tokenUsage;

    @JsonProperty("latency_ms")
    private Integer latencyMs;

    @JsonProperty("evaluated_at")
    private Long evaluatedAt;

    // Nested classes for Feedback and TokenUsage
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Feedback {

        @JsonProperty("overall")
        private String overall;

        @JsonProperty("fluency")
        private Fluency fluency;

        @JsonProperty("lexical")
        private Lexical lexical;

        @JsonProperty("grammar")
        private Grammar grammar;

        @JsonProperty("pronunciation")
        private Pronunciation pronunciation;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Fluency {

        @JsonProperty("band")
        private Double band;

        @JsonProperty("feedback")
        private String feedback;

        @JsonProperty("strengths")
        private String[] strengths;

        @JsonProperty("weaknesses")
        private String[] weaknesses;

        @JsonProperty("improvements")
        private String[] improvements;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Lexical {

        @JsonProperty("band")
        private Double band;

        @JsonProperty("feedback")
        private String feedback;

        @JsonProperty("strengths")
        private String[] strengths;

        @JsonProperty("weaknesses")
        private String[] weaknesses;

        @JsonProperty("improvements")
        private String[] improvements;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Grammar {

        @JsonProperty("band")
        private Double band;

        @JsonProperty("feedback")
        private String feedback;

        @JsonProperty("strengths")
        private String[] strengths;

        @JsonProperty("weaknesses")
        private String[] weaknesses;

        @JsonProperty("improvements")
        private String[] improvements;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Pronunciation {

        @JsonProperty("band")
        private Double band;

        @JsonProperty("feedback")
        private String feedback;

        @JsonProperty("strengths")
        private String[] strengths;

        @JsonProperty("weaknesses")
        private String[] weaknesses;

        @JsonProperty("improvements")
        private String[] improvements;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TokenUsage {

        @JsonProperty("input_tokens")
        private Integer inputTokens;

        @JsonProperty("output_tokens")
        private Integer outputTokens;

        @JsonProperty("total_tokens")
        private Integer totalTokens;
    }
}
