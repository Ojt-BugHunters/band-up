package com.project.Band_Up.dtos.quizlet;

import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeckDtoResponse {
    private String title    ;
    private String description;
    private int learnerNumber;
    private boolean isPublic;
    private LocalDateTime createdAt;
    private String authorName;
}
