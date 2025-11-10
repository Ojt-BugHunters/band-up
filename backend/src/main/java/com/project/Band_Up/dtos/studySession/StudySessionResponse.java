package com.project.Band_Up.dtos.studySession;

import com.project.Band_Up.enums.SessionMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudySessionResponse {
    private UUID id;
    private UUID userId;
    private SessionMode mode;
    private BigInteger focusTime;
    private BigInteger shortBreak;
    private BigInteger longBreak;
    private Integer cycles;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Boolean status;
    private LocalDateTime createdAt;
    private BigInteger totalFocusTime;
}
