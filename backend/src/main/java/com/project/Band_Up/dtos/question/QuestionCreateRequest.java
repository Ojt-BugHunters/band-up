package com.project.Band_Up.dtos.question;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuestionCreateRequest {
    private Integer difficult;
    private String type;
    private Map<String, Object> content;
}
