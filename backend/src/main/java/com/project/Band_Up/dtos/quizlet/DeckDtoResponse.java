package com.project.Band_Up.dtos.quizlet;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeckDtoResponse {
    private UUID id;
    private String title    ;
    private String description;
    private int learnerNumber;
    private boolean isPublic;
    private LocalDateTime createdAt;
    private String authorName;
}
