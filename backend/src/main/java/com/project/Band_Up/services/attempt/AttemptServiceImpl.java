package com.project.Band_Up.services.attempt;

import com.project.Band_Up.dtos.attempt.AttemptCreateRequest;
import com.project.Band_Up.dtos.attempt.AttemptResponse;
import com.project.Band_Up.dtos.attempt.AttemptUpdateRequest;
import com.project.Band_Up.dtos.attemptSection.AttemptSectionResponse;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Attempt;
import com.project.Band_Up.entities.AttemptSection;
import com.project.Band_Up.entities.Test;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.AttemptRepository;
import com.project.Band_Up.repositories.AttemptSectionRepository;
import com.project.Band_Up.repositories.TestRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttemptServiceImpl implements AttemptService {
    private final AttemptRepository attemptRepository;
    private final AttemptSectionRepository attemptSectionRepository;
    private final AccountRepository accountRepository;
    private final TestRepository testRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<AttemptResponse> getAllAttemptsByUserId(UUID userId) {
        accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Attempt> attempts = attemptRepository.findAllByUser_IdOrderByStartAtDesc(userId);
        return attempts.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttemptResponse> getAllAttemptsByUserIdAndTestId(UUID userId, UUID testId) {
        accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        List<Attempt> attempts = attemptRepository.findAllByUser_IdAndTest_IdOrderByStartAtDesc(userId, testId);
        return attempts.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AttemptResponse getAttemptById(UUID attemptId) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        return toResponse(attempt);
    }

    @Override
    public List<AttemptResponse> getAttemptsByUserIdAndStatus(UUID userId, Status status) {
        accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Attempt> attempts = attemptRepository.findAllByUser_IdAndStatusOrderByStartAtDesc(userId, status);
        return attempts.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AttemptResponse createAttempt(UUID userId, UUID testId, AttemptCreateRequest createRequest) {
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        Attempt attempt = modelMapper.map(createRequest, Attempt.class);
        attempt.setUser(user);
        attempt.setTest(test);
        attempt.setStatus(Status.ONGOING);

        Attempt saved = attemptRepository.save(attempt);
        return toResponse(saved);
    }

    @Override
    public AttemptResponse updateAttempt(UUID attemptId, UUID userId, AttemptUpdateRequest updateRequest) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not the owner of this attempt");
        }

        modelMapper.map(updateRequest, attempt);
        Attempt updated = attemptRepository.save(attempt);

        return toResponse(updated);
    }

    @Override
    public void deleteAttempt(UUID attemptId, UUID userId) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not the owner of this attempt");
        }
        List<AttemptSection> attemptSection = attemptSectionRepository.findByAttemptId(attemptId);
        attemptSectionRepository.deleteAll(attemptSection);
        attemptRepository.delete(attempt);
    }

    private AttemptResponse toResponse(Attempt attempt) {
        AttemptResponse response = modelMapper.map(attempt, AttemptResponse.class);
        if (attempt.getUser() != null) {
            response.setUserId(attempt.getUser().getId());
        }
        if (attempt.getTest() != null) {
            response.setTestId(attempt.getTest().getId());
        }
        List<AttemptSection> sections =
                attemptSectionRepository.findAllByAttempt_IdOrderByStartAtDesc(attempt.getId());
        List<AttemptSectionResponse> sectionResponses = sections.stream()
                .map(s -> AttemptSectionResponse.builder()
                        .id(s.getId())
                        .attemptId(s.getAttempt().getId())
                        .sectionId(s.getSection().getId())
                        .startAt(s.getStartAt())
                        .status(s.getStatus())
                        .build()
                )
                .toList();
        response.setAttemptSections(sectionResponses);
        return response;
    }
}
