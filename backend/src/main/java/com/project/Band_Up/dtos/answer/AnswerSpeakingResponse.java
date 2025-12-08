package com.project.Band_Up.dtos.answer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnswerSpeakingResponse {
    private UUID AnswerId;
    private String questionContent;
    private String answerContent;
    private String s3Key;
}
