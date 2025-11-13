package com.project.Band_Up.dtos.studySessionInterval;

import com.project.Band_Up.enums.SessionMode;
import com.project.Band_Up.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudySessionIntervalCreateRequest {
    private SessionMode type;
    private Status status;
}
