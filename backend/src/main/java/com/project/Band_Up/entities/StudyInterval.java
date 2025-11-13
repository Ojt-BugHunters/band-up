package com.project.Band_Up.entities;

import com.project.Band_Up.enums.SessionMode;
import com.project.Band_Up.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
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
@Builder
public class StudyInterval {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "study_session_id", foreignKey = @ForeignKey(name = "fk_study_interval_study_session"))
    private StudySession studySession;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)

    private SessionMode type;
    private Integer orderIndex;
    private LocalDateTime startAt;
    private LocalDateTime endedAt;
    private LocalDateTime pingedAt;
    private BigInteger duration;
    @Enumerated(EnumType.STRING)
    private Status status;
}
