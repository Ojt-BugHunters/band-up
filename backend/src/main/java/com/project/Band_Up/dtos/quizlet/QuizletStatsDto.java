package com.project.Band_Up.dtos.quizlet;

import com.project.Band_Up.enums.StatsInterval;
import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuizletStatsDto {

    private int totalLearners;
    private int totalLearnersDifference;

    private int totalCards;
    private int totalCardsDifference;

    private int activeDecks;
    private int activeDecksDifference;

    private float completionRate;
    private float completionRateDifference;

    private StatsInterval statsInterval;
}
