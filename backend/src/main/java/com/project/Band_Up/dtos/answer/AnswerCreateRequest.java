package com.project.Band_Up.dtos.answer;

import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerCreateRequest {
    private String answerContent;
}
