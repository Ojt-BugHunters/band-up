package com.project.Band_Up.services.studySession;

import com.project.Band_Up.dtos.studySession.StudySessionCreateRequest;
import com.project.Band_Up.dtos.studySession.StudySessionResponse;
import com.project.Band_Up.dtos.studySessionInterval.StudySessionIntervalUpdateRequest;

import java.util.UUID;

public interface StudySessionService {
    StudySessionResponse createStudySession(StudySessionCreateRequest request, UUID userId);

    StudySessionResponse startInterval(UUID sessionId, UUID intervalId);

    StudySessionResponse endInterval(UUID sessionId, UUID intervalId);

    StudySessionResponse pingInterval(UUID sessionId, UUID intervalId, StudySessionIntervalUpdateRequest request);

    StudySessionResponse resetInterval(UUID sessionId, UUID intervalId);

    StudySessionResponse pauseInterval(UUID sessionId, UUID intervalId);
}
