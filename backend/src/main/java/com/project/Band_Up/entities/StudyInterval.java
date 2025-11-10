package com.project.Band_Up.entities;

import com.project.Band_Up.enums.SessionMode;
import com.project.Band_Up.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
<<<<<<< Updated upstream
import lombok.Builder;
=======
>>>>>>> Stashed changes
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
<<<<<<< Updated upstream
@Builder
public class StudyInterval {
    @Id
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "study_session_id", foreignKey = @ForeignKey(name = "fk_study_interval_study_session"))
    private StudySession studySession;

    @Column(nullable = false)
    private SessionMode type;

    private LocalDateTime startAt;
    private LocalDateTime endedAt;
    private LocalDateTime pingedAt;
    private BigInteger duration;
    private Status status;

=======
public class StudyInterval {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY, optional = false)
    @JoinColumn(name = "study_session_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_study_interval_study_session"))
    private StudySession studySession;

    private SessionMode type;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime pingedAt;
    private BigInteger totalFocusTime;
    private Status status;
>>>>>>> Stashed changes
}
