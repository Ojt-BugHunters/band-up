package com.project.Band_Up.entities;

import com.project.Band_Up.enums.SessionMode;
import com.project.Band_Up.enums.Status;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;
import org.joda.time.DateTime;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudySession {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_study_session_user"))
    private Account user;

    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY, optional = false)
    @JoinColumn(name= "room_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_study_session_room"))
    private Room room;

    @NotNull
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SessionMode mode;

    @NotNull
    @Column(nullable = false)
    private BigInteger focusTime;
    @NotNull
    @Column(nullable = false)
    private BigInteger shortBreak;
    @NotNull
    @Column(nullable = false)
    private BigInteger longBreak;
    @NotNull
    @Column(nullable = false)
    private Integer cycles;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private BigInteger totalFocusTime;

    @NotNull
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createAt;
}
