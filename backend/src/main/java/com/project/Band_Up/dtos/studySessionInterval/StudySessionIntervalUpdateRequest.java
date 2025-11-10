package com.project.Band_Up.dtos.studySessionInterval;

import com.project.Band_Up.enums.SessionMode;
import com.project.Band_Up.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudySessionUpdateRequest {
    private LocalDateTime startAt;
    private LocalDateTime endedAt;
    private LocalDateTime pingedAt;
    private BigInteger duration;
    private Status status;
}
