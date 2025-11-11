package com.project.Band_Up.services.studySession;

import com.project.Band_Up.dtos.studyInterval.StudyIntervalCreateRequest;
import com.project.Band_Up.dtos.studyInterval.StudyIntervalResponse;
import com.project.Band_Up.dtos.studySession.StudySessionCreateRequest;
import com.project.Band_Up.dtos.studySession.StudySessionResponse;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.StudyInterval;
import com.project.Band_Up.entities.StudySession;
import com.project.Band_Up.enums.SessionMode;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.StudyIntervalRepository;
import com.project.Band_Up.repositories.StudySessionRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class StudySessionServiceImpl implements StudySessionService {
    private final AccountRepository accountRepository;
    private final StudySessionRepository studySessionRepository;
    private final StudyIntervalRepository studyIntervalRepository;
    private final ModelMapper modelMapper;

    @Override
    public StudySessionResponse createStudySession(StudySessionCreateRequest request, UUID userId) {
        StudySession studySession = toEntity(request, userId);
        studySession.setStatus(Status.Pending);
        StudySession saved = studySessionRepository.save(studySession);
        generateStudyIntervals(saved);
        return toResponse(saved);
    }
    private Account checkAccountExists(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return accountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
    }
    private void checkStudySessionExists(UUID sessionId) {
        studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Study Session not found"));
    }
    private StudySessionResponse toResponse(StudySession studySession) {
        StudySessionResponse response = modelMapper.map(studySession, StudySessionResponse.class);
        response.setUserId(studySession.getUser().getId());
        List<StudyInterval> intervals = studyIntervalRepository.findByStudySessionOrderByOrderIndexAsc(studySession);
        List<StudyIntervalResponse> intervalResponses = intervals.stream()
                .map(interval -> modelMapper.map(interval, StudyIntervalResponse.class))
                .toList();

        response.setInterval(intervalResponses);
        return response ;
    }
    private StudySession toEntity(StudySessionCreateRequest request, UUID userId) {
        StudySession studySession = modelMapper.map(request, StudySession.class);
        Account user = checkAccountExists(userId);
        studySession.setUser(user);
        return studySession;
    }
    private StudyInterval createInterval(StudySession session, SessionMode type) {
        StudyIntervalCreateRequest dto = StudyIntervalCreateRequest.builder()
                .studySessionId(session.getId())
                .type(type)
                .status(Status.Pending)
                .build();

        StudyInterval interval = modelMapper.map(dto, StudyInterval.class);
        interval.setStudySession(studySessionRepository.findById(session.getId())
                .orElseThrow(() -> new IllegalArgumentException("Session not found")));
        return interval;
    }
    private void generateStudyIntervals(StudySession session) {
        if (session.getMode() != SessionMode.FocusTimer) return;

        int cycles = session.getCycles();
        List<StudyInterval> intervals = new ArrayList<>();
        int order = 1;
        for (int i = 0; i < cycles * 2; i++) {
            SessionMode type = (i % 2 == 0)
                    ? SessionMode.Focus
                    : SessionMode.ShortBreak;
            StudyInterval interval = createInterval(session, type);
            interval.setOrderIndex(order++);
            intervals.add(interval);
        }


        StudyInterval longBreak = createInterval(session, SessionMode.LongBreak);
        longBreak.setOrderIndex(order++);
        intervals.add(longBreak);

        studyIntervalRepository.saveAll(intervals);
    }

}
