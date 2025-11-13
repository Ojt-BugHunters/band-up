package com.project.Band_Up.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
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

    private int completionRate;

    private LocalDateTime recordedAt = LocalDateTime.now();
}
