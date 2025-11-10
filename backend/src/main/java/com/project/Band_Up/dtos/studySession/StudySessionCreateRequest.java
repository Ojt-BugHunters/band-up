package com.project.Band_Up.dtos.studySession;

import com.project.Band_Up.enums.SessionMode;
import com.project.Band_Up.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudySessionCreateRequest {
    private SessionMode mode;
    private BigInteger focusTime;
    private BigInteger shortBreak;
    private BigInteger longBreak;
    private Integer cycles;
}
