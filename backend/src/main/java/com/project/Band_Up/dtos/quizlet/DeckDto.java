package com.project.Band_Up.dtos.quizlet;

import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class DeckDto {
    private String title;
    private String description;
    private boolean isPublic;
    private String password;
    private List<CardDto> cards;
}
