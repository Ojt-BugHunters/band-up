package com.project.Band_Up.dtos.question;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data

public class QuestionContent {
    private String type;

    @JsonProperty("correctAnswer")
    private String correctAnswer;

    private int questionNumber;
}
