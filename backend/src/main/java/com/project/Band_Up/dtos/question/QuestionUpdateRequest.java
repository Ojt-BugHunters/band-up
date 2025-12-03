package com.project.Band_Up.dtos.question;

import lombok.*;

import java.util.Map;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuestionUpdateRequest {
    private String difficult;
    private String type;
    private Map<String, Object> content;
}
