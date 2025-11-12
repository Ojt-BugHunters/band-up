package com.project.Band_Up.services.studySession;

import com.project.Band_Up.dtos.studyInterval.StudyIntervalResponse;
import com.project.Band_Up.dtos.studySession.StudySessionCreateRequest;
import com.project.Band_Up.dtos.studySession.StudySessionResponse;
import com.project.Band_Up.dtos.studySessionInterval.StudySessionIntervalUpdateRequest;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Room;
import com.project.Band_Up.entities.StudyInterval;
import com.project.Band_Up.entities.StudySession;
import com.project.Band_Up.enums.SessionMode;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.RoomRepository;
import com.project.Band_Up.repositories.StudyIntervalRepository;
import com.project.Band_Up.repositories.StudySessionRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StudySessionServiceImpl implements StudySessionService {

    private final AccountRepository accountRepository;
    private final StudySessionRepository studySessionRepository;
    private final StudyIntervalRepository studyIntervalRepository;
    private final RoomRepository roomRepository;
    private final ModelMapper modelMapper;

    @Override
    public StudySessionResponse createStudySession(StudySessionCreateRequest request, UUID userId) {
        StudySession studySession = toEntity(request, getAccount(userId));
        studySession.setStatus(Status.PENDING);

        StudySession saved = studySessionRepository.save(studySession);
        generateStudyIntervals(saved);

        return toResponse(saved);
    }

    @Override
    public StudySessionResponse startInterval(UUID sessionId, UUID intervalId) {
        StudySession session = getSession(sessionId);
        StudyInterval interval = getInterval(intervalId);

        if (interval.getStartAt() == null) {
            interval.setStartAt(LocalDateTime.now());
            interval.setStatus(Status.ONGOING);
        }
        if (session.getStartedAt() == null) {
            session.setStartedAt(interval.getStartAt());
            session.setStatus(Status.ONGOING);
        }

        return saveAndReturn(session, interval);
    }

    @Override
    public StudySessionResponse endInterval(UUID sessionId, UUID intervalId) {
        StudySession session = getSession(sessionId);
        StudyInterval interval = getInterval(intervalId);

        interval.setEndedAt(LocalDateTime.now());
        interval.setStatus(Status.ENDED);
        if (interval.getStartAt() != null) {
            long seconds = java.time.Duration.between(interval.getStartAt(), interval.getEndedAt()).getSeconds();
            interval.setDuration(BigInteger.valueOf(seconds));
        }
        List<StudyInterval> all = studyIntervalRepository.findByStudySessionOrderByOrderIndexAsc(session);
        boolean allDone = all.stream().allMatch(i -> i.getStatus() == Status.ENDED);
        if (allDone) {
            session.setEndedAt(LocalDateTime.now());
            session.setStatus(Status.ENDED);

            BigInteger totalFocus = all.stream()
                    .filter(i -> i.getType() == SessionMode.Focus)
                    .map(i -> Optional.ofNullable(i.getDuration()).orElse(BigInteger.ZERO))
                    .reduce(BigInteger.ZERO, BigInteger::add);

            session.setTotalFocusTime(totalFocus);
        }
        return saveAndReturn(session, interval);
    }

    @Override
    public StudySessionResponse pingInterval(UUID sessionId, UUID intervalId, StudySessionIntervalUpdateRequest request) {
        StudySession session = getSession(sessionId);
        StudyInterval interval = getInterval(intervalId);

        if (Set.of(Status.PENDING, Status.ENDED, Status.PAUSED).contains(interval.getStatus())) {
            throw new IllegalArgumentException("Cannot ping an interval that has not started");
        }

        interval.setPingedAt(LocalDateTime.now());
        if (interval.getStartAt() != null) {
            long seconds = Duration.between(interval.getStartAt(), interval.getPingedAt()).getSeconds();
            interval.setDuration(BigInteger.valueOf(seconds));
        }
        studyIntervalRepository.save(interval);

        List<StudyInterval> allIntervals = studyIntervalRepository.findByStudySessionOrderByOrderIndexAsc(session);
        BigInteger totalFocus = allIntervals.stream()
                .filter(i -> i.getType() == SessionMode.Focus)
                .map(i -> Optional.ofNullable(i.getDuration()).orElse(BigInteger.ZERO))
                .reduce(BigInteger.ZERO, BigInteger::add);

        session.setTotalFocusTime(totalFocus);
        studySessionRepository.save(session);
        return toResponse(session);

    }


    @Override
    public StudySessionResponse resetInterval(UUID sessionId, UUID intervalId) {
        StudySession session = getSession(sessionId);
        StudyInterval interval = getInterval(intervalId);

        interval.setStartAt(null);
        interval.setEndedAt(null);
        interval.setPingedAt(null);
        interval.setDuration(null);
        interval.setStatus(Status.PENDING);

        return saveAndReturn(session, interval);
    }

    @Override
    public StudySessionResponse pauseInterval(UUID sessionId, UUID intervalId) {
        StudySession session = getSession(sessionId);
        StudyInterval interval = getInterval(intervalId);

        if (interval.getStatus() != Status.ONGOING) {
            throw new IllegalArgumentException("Only ongoing intervals can be paused");
        }

        interval.setStatus(Status.PAUSED);
        return saveAndReturn(session, interval);
    }


    private Account getAccount(UUID userId) {
        if (userId == null)
            throw new IllegalArgumentException("User ID cannot be null");
        return accountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
    }
    private Room getRoom(UUID roomId) {
        if (roomId == null )
            throw new IllegalArgumentException("Room ID cannot be null");
        return roomRepository.findById(roomId).orElseThrow(() -> new IllegalArgumentException("Room not found"));
    }

    private StudySession getSession(UUID sessionId) {
        return studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Study session not found"));
    }

    private StudyInterval getInterval(UUID intervalId) {
        return studyIntervalRepository.findById(intervalId)
                .orElseThrow(() -> new IllegalArgumentException("Study interval not found"));
    }

    private StudySessionResponse saveAndReturn(StudySession session, StudyInterval interval) {
        studyIntervalRepository.save(interval);
        studySessionRepository.save(session);
        return toResponse(session);
    }

    private StudySession toEntity(StudySessionCreateRequest request, Account user) {
        StudySession studySession = modelMapper.map(request, StudySession.class);
        studySession.setUser(user);
        if (request.getRoomId() != null) {
            Room room = getRoom(request.getRoomId());
            studySession.setRoom(room);
        } else {
            studySession.setRoom(null);
        }
        return studySession;
    }

    private StudySessionResponse toResponse(StudySession studySession) {
        StudySessionResponse response = modelMapper.map(studySession, StudySessionResponse.class);
        response.setUserId(studySession.getUser().getId());
        response.setRoomId(studySession.getRoom().getId());

        List<StudyIntervalResponse> intervalResponses = studyIntervalRepository
                .findByStudySessionOrderByOrderIndexAsc(studySession)
                .stream()
                .map(interval -> modelMapper.map(interval, StudyIntervalResponse.class))
                .collect(Collectors.toList());

        response.setInterval(intervalResponses);
        return response;
    }

    private void generateStudyIntervals(StudySession session) {
        if (session.getMode() == SessionMode.FocusTimer) {
            int cycles = session.getCycles();
            List<StudyInterval> intervals = new ArrayList<>();
            int order = 1;

            for (int i = 0; i < cycles * 2; i++) {
                SessionMode type = (i % 2 == 0) ? SessionMode.Focus : SessionMode.ShortBreak;
                intervals.add(createInterval(session, type, order++));
            }

            intervals.add(createInterval(session, SessionMode.LongBreak, order));
            studyIntervalRepository.saveAll(intervals);
            return;
        }

        if (session.getMode() == SessionMode.StopWatch) {
            StudyInterval interval = createInterval(session, SessionMode.Focus, 1);
            interval.setStatus(Status.PENDING);
            studyIntervalRepository.save(interval);
            return;
        }
    }


    private StudyInterval createInterval(StudySession session, SessionMode type, int order) {
        StudyInterval interval = new StudyInterval();
        interval.setStudySession(session);
        interval.setType(type);
        interval.setStatus(Status.PENDING);
        interval.setOrderIndex(order);
        return interval;
    }
}
