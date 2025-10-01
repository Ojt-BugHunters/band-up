package com.project.Band_Up.dtos.answer;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerResponse {
    private UUID id;
    private UUID attemptSectionId;
    private UUID questionId;
    private String answerContent;
    private boolean isCorrect;
    private LocalDateTime createAt;
}
