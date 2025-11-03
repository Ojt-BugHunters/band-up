package com.project.Band_Up.dtos.question;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuestionCreateRequest {
    private String difficult;
    private String type;
    private String fileName;
    private String script;
    private String contentType;
    private Map<String, Object> content;
}
