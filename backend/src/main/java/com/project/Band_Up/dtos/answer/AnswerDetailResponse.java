package com.project.Band_Up.dtos.answer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnswerDetailResponse {
    private UUID AnswerId;
    private Integer questionNumber;
    private String answerContent;
    private String correctAnswer;
    private boolean isCorrect;
}
