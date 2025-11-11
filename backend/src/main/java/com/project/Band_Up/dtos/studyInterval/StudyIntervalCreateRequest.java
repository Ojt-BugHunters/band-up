package com.project.Band_Up.dtos.studyInterval;

import com.project.Band_Up.enums.SessionMode;
import com.project.Band_Up.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudyIntervalCreateRequest {
    private UUID studySessionId;
    private SessionMode type;
    private Status status;
}
