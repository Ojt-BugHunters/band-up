package com.project.Band_Up.dtos.quizlet;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeckResponse {
    private UUID id;
    private String title    ;
    private String description;
    private int learnerNumber;
    private boolean isPublic;
    private LocalDateTime createdAt;
    private String authorName;
    private List<CardDto> cards;
}
