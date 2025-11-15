package com.project.Band_Up.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class QuizletStat {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private int totalLearners;

    private int totalCards;

    private int activeDecks;

    private float completionRate;

    private LocalDateTime recordedAt = LocalDateTime.now();
}
