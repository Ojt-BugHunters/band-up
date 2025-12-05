package com.project.Band_Up.dtos.answer;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DictationAnswerResponse {
    private UUID id;
    private UUID attemptSectionId;
    private UUID questionId;
    private String answerContent;
    private String correctAnswer;
    private boolean isCorrect;
    private List<MistakeDetailDto> mistakes;
    private double accuracy;
    private LocalDateTime createAt;
}
