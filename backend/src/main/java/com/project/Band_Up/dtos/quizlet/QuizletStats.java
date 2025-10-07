package com.project.Band_Up.dtos.quizlet;

import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuizletStats {

    private long totalCards;

    private long totalDecks;

    private long totalLearners;

}
