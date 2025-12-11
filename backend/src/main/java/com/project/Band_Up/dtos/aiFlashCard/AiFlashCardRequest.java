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
public class AiFlashCardRequest {

    @JsonProperty("set_id")
    private String setId;

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("document_id")
    private String documentId;

    @JsonProperty("pdf_url")
    private String pdfUrl;

    @JsonProperty("num_cards")
    private Integer numCards;

    @JsonProperty("difficulty")
    private String difficulty;

    @JsonProperty("question_types")
    private List<String> questionTypes;
}
