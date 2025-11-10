package com.project.Band_Up.dtos.studySession;

import com.project.Band_Up.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudySessionUpdateRequest {
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Status status;
    private BigInteger totalFocusTime;
}
