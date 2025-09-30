package com.project.Band_Up.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attempt")
public class Attempt {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_attempt_user"))
    private Account user;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "test_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_attempt_test"))
    private Test test;
    private LocalDateTime startAt;
    private LocalDateTime submitAt;
    private String status; // IN_PROGRESS, COMPLETED, SUBMITTED
    private Integer score; // điểm số
    private Double overallBand; // điểm band overall



}
