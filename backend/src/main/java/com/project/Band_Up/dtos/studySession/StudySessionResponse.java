package com.project.Band_Up.dtos.studySession;

import com.project.Band_Up.dtos.studyInterval.StudyIntervalResponse;
import com.project.Band_Up.enums.SessionMode;
import com.project.Band_Up.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudySessionResponse {
    private UUID id;
    private UUID userId;
    private UUID roomId;
    private SessionMode mode;
    private BigInteger focusTime;
    private BigInteger shortBreak;
    private BigInteger longBreak;
    private Integer cycles;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Status status;
    private LocalDateTime createdAt;
    private BigInteger totalFocusTime;
    List<StudyIntervalResponse> interval;
}
