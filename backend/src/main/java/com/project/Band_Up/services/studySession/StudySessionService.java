package com.project.Band_Up.services.studySession;

import com.project.Band_Up.dtos.studySession.StudySessionCreateRequest;
import com.project.Band_Up.dtos.studySession.StudySessionResponse;
import com.project.Band_Up.dtos.studySession.TopUserStudyTimeDto;
import com.project.Band_Up.dtos.studySessionInterval.StudySessionIntervalUpdateRequest;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.enums.StatsInterval;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface StudySessionService {
    StudySessionResponse createStudySession(StudySessionCreateRequest request, UUID userId, UUID roomId);

    StudySessionResponse startInterval(UUID sessionId, UUID intervalId);

    StudySessionResponse endInterval(UUID sessionId, UUID intervalId);

    StudySessionResponse pingInterval(UUID sessionId, UUID intervalId, StudySessionIntervalUpdateRequest request);

    StudySessionResponse resetInterval(UUID sessionId, UUID intervalId);

    void pauseInterval(UUID sessionId, UUID intervalId);

    List<TopUserStudyTimeDto> getTopUsersByStudyTime(StatsInterval interval, LocalDate date);
    void endPauseInterval(UUID sessionId, UUID intervalId);

    List<StudySessionResponse> getStudySessionByStatus(UUID userId, Status status);
}
