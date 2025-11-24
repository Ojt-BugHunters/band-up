package com.project.Band_Up.dtos.studyInterval;

import com.project.Band_Up.enums.SessionMode;
import com.project.Band_Up.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudyIntervalResponse{
    private UUID id;
    private UUID studySessionId;
    private SessionMode type;
    private Integer orderIndex;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime pingedAt;
    private Integer duration;
    private Status status;
}
