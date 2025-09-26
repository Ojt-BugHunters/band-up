package com.project.Band_Up.dtos.question;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuestionResponse {
    private UUID id;
    private UUID sectionId;
    private String type;
    private Map<String, Object> content;
    private Integer difficult;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
