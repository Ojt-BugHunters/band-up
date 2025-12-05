package com.project.Band_Up.dtos.answer;

import lombok.*;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerCreateRequest {
    List<AnswerDetail> answers;
}
