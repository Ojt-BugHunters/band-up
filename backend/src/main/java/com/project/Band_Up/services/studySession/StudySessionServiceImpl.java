package com.project.Band_Up.services.studySession;

import com.project.Band_Up.dtos.studySession.StudySessionCreateRequest;
import com.project.Band_Up.dtos.studySession.StudySessionResponse;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.StudySession;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.StudySessionRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class StudySessionServiceImpl implements StudySessionService {
    private final AccountRepository accountRepository;
    private final StudySessionRepository studySessionRepository;
    private final ModelMapper modelMapper;

    @Override
    public StudySessionResponse createStudySession(StudySessionCreateRequest request, UUID userId) {
        StudySession studySession = toEntity(request, userId);
        StudySession saved = studySessionRepository.save(studySession);
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
        return response ;
    }
    private StudySession toEntity(StudySessionCreateRequest request, UUID userId) {
        StudySession studySession = modelMapper.map(request, StudySession.class);
        Account user = checkAccountExists(userId);
        studySession.setUser(user);
        return studySession;
    }
}
