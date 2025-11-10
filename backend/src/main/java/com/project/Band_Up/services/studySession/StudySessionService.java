package com.project.Band_Up.services.studySession;

import com.project.Band_Up.dtos.studySession.StudySessionCreateRequest;
import com.project.Band_Up.dtos.studySession.StudySessionResponse;

import java.util.UUID;

public interface StudySessionService {
    StudySessionResponse createStudySession(StudySessionCreateRequest request, UUID userId);

}
