package com.project.Band_Up.dtos.quizlet;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class CompletionRateDto {
    private String month;
    private int rate;
}
