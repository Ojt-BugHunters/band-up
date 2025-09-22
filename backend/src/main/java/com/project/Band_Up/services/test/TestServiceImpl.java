package com.project.Band_Up.services.test;

import com.project.Band_Up.dtos.test.TestCreateRequest;
import com.project.Band_Up.dtos.test.TestResponse;
import com.project.Band_Up.dtos.test.TestUpdateRequest;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Test;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.TestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestServiceImpl implements TestService {

    private final TestRepository testRepository;
    private final AccountRepository accountRepository;

    // ----------------- CREATE -----------------
    @Override
    public TestResponse createTest(TestCreateRequest request) {
        Account user = accountRepository.findById(UUID.fromString(request.getUserId()))
                .orElseThrow(() -> new RuntimeException("User not found"));
        Test test = Test.builder()
                .user(user)
                .skillName(request.getSkillName())
                .title(request.getTitle())
                .number_of_people(request.getNumberOfPeople())
                .duration_seconds(request.getDurationSeconds())
                .createAt(LocalDateTime.now())
                .build();

        Test saved = testRepository.save(test);
        return mapToResponse(saved);
    }

    // ----------------- READ -----------------
    @Override
    public List<TestResponse> getAllTests() {
        return testRepository.findAll()
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TestResponse> getAllTestsSortedByCreateAt() {
        return testRepository.findAllByOrderByCreateAtDesc()
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TestResponse> getTestsBySkillName(String skillName) {
        return testRepository.findBySkillName(skillName)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TestResponse> searchTestsByTitle(String keyword) {
        return testRepository.findByTitleContainingIgnoreCase(keyword)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ----------------- UPDATE -----------------
    @Override
    public TestResponse updateTest(TestUpdateRequest request) {
        Test test = testRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Test not found"));

        if (request.getSkillName() != null) test.setSkillName(request.getSkillName());
        if (request.getTitle() != null) test.setTitle(request.getTitle());
        if (request.getNumberOfPeople() != null) test.setNumber_of_people(request.getNumberOfPeople());
        if (request.getDurationSeconds() != null) test.setDuration_seconds(request.getDurationSeconds());

        Test updated = testRepository.save(test);
        return mapToResponse(updated);
    }

    // ----------------- DELETE -----------------
    @Override
    public void deleteTest(UUID id) {
        if (!testRepository.existsById(id)) {
            throw new RuntimeException("Test not found");
        }
        testRepository.deleteById(id);
    }

    // ----------------- HELPER -----------------
    private TestResponse mapToResponse(Test test) {
        return TestResponse.builder()
                .id(test.getId())
                .userId(test.getUser().getId())
                .title(test.getTitle())
                .skillName(test.getSkillName())
                .number_of_people(test.getNumber_of_people())
                .duration_seconds(test.getDuration_seconds())
                .createAt(test.getCreateAt())
                .build();
    }
}
