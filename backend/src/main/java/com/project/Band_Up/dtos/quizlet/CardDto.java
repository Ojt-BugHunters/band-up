package com.project.Band_Up.dtos.quizlet;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CardDto {
    private String front;
    private String back;
}
