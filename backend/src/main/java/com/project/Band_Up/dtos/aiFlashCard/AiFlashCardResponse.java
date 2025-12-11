package com.project.Band_Up.dtos.aiFlashCard;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AiFlashCardResponse {

    @JsonProperty("status")
    private String status;

    @JsonProperty("set_id")
    private String setId;

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("document_id")
    private String documentId;

    @JsonProperty("document")
    private Document document;

    @JsonProperty("retrieval")
    private Retrieval retrieval;

    @JsonProperty("flashcards")
    private List<Flashcard> flashcards;

    @JsonProperty("total_cards")
    private Integer totalCards;

    @JsonProperty("difficulty")
    private String difficulty;

    @JsonProperty("question_types")
    private List<String> questionTypes;

    @JsonProperty("metrics")
    private Metrics metrics;

    // Nested classes
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Document {

        @JsonProperty("s3_bucket")
        private String s3Bucket;

        @JsonProperty("s3_key")
        private String s3Key;

        @JsonProperty("pdf_url")
        private String pdfUrl;

        @JsonProperty("page_count")
        private Integer pageCount;

        @JsonProperty("chunk_count")
        private Integer chunkCount;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Retrieval {

        @JsonProperty("method")
        private String method;

        @JsonProperty("smart_queries")
        private List<String> smartQueries;

        @JsonProperty("keywords")
        private List<String> keywords;

        @JsonProperty("chunks_used")
        private Integer chunksUsed;

        @JsonProperty("avg_score")
        private Double avgScore;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Flashcard {

        @JsonProperty("question")
        private String question;

        @JsonProperty("answer")
        private String answer;

        @JsonProperty("type")
        private String type;

        @JsonProperty("difficulty")
        private String difficulty;

        @JsonProperty("source_chunk")
        private Integer sourceChunk;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Metrics {

        @JsonProperty("download_time_ms")
        private Integer downloadTimeMs;

        @JsonProperty("index_time_ms")
        private Integer indexTimeMs;

        @JsonProperty("retrieve_time_ms")
        private Integer retrieveTimeMs;

        @JsonProperty("generate_time_ms")
        private Integer generateTimeMs;

        @JsonProperty("total_time_ms")
        private Integer totalTimeMs;
    }
}
