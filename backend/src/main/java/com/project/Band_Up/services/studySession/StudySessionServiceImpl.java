package com.project.Band_Up.services.studySession;

import com.project.Band_Up.dtos.studyInterval.StudyIntervalCreateRequest;
import com.project.Band_Up.dtos.studyInterval.StudyIntervalResponse;
import com.project.Band_Up.dtos.studySession.StudySessionCreateRequest;
import com.project.Band_Up.dtos.studySession.StudySessionResponse;
import com.project.Band_Up.dtos.studySessionInterval.StudySessionIntervalUpdateRequest;
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

import java.math.BigInteger;
import java.time.LocalDateTime;
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
    @Override
    public StudySessionResponse startInterval(UUID sessionId, UUID intervalId) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Study session not found"));
        StudyInterval interval = studyIntervalRepository.findById(intervalId)
                .orElseThrow(() -> new IllegalArgumentException("Study interval not found"));
        if (interval.getStartAt() == null) {
            interval.setStartAt(LocalDateTime.now());
            interval.setStatus(Status.Ongoing);
        }
        if (session.getStartedAt() == null) {
            session.setStartedAt(interval.getStartAt());
            session.setStatus(Status.Ongoing);
        }

        studyIntervalRepository.save(interval);
        studySessionRepository.save(session);
        return toResponse(session);
    }

    @Override
    public StudySessionResponse endInterval(UUID sessionId, UUID intervalId) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Study session not found"));
        StudyInterval interval = studyIntervalRepository.findById(intervalId)
                .orElseThrow(() -> new IllegalArgumentException("Study interval not found"));
        interval.setEndedAt(LocalDateTime.now());
        interval.setStatus(Status.Ended);
        if (interval.getStartAt() != null) {
            long seconds = java.time.Duration.between(interval.getStartAt(), interval.getEndedAt()).getSeconds();
            interval.setDuration(BigInteger.valueOf(seconds));
        }
        studyIntervalRepository.save(interval);
        List<StudyInterval> all = studyIntervalRepository.findByStudySessionOrderByOrderIndexAsc(session);
        boolean allDone = all.stream().allMatch(i -> i.getStatus() == Status.Ended);

        if (allDone) {
            session.setEndedAt(LocalDateTime.now());
            session.setStatus(Status.Ended);

            BigInteger totalFocus = all.stream()
                    .filter(i -> i.getType() == SessionMode.Focus)
                    .map(i -> i.getDuration() == null ? BigInteger.ZERO : i.getDuration())
                    .reduce(BigInteger.ZERO, BigInteger::add);

            session.setTotalFocusTime(totalFocus);
        }

        studySessionRepository.save(session);
        return toResponse(session);
    }

    @Override
    public StudySessionResponse pingInterval(UUID sessionId, UUID intervalId, StudySessionIntervalUpdateRequest request) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Study session not found"));
        StudyInterval interval = studyIntervalRepository.findById(intervalId)
                .orElseThrow(() -> new IllegalArgumentException("Study interval not found"));

        interval.setPingedAt(LocalDateTime.now());
        interval.setStatus(request.getStatus() != null ? request.getStatus() : interval.getStatus());
        studyIntervalRepository.save(interval);

        return toResponse(session);
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
