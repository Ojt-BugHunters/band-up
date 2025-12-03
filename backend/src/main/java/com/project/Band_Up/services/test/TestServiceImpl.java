package com.project.Band_Up.services.test;

import com.project.Band_Up.dtos.test.TestCreateRequest;
import com.project.Band_Up.dtos.test.TestResponse;
import com.project.Band_Up.dtos.test.TestUpdateRequest;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Test;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.TestRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestServiceImpl implements TestService {

    private final TestRepository testRepository;
    private final AccountRepository accountRepository;
    private final ModelMapper modelMapper;

    // ----------------- CREATE -----------------
    @Override
    public TestResponse createTest(UUID accountId, TestCreateRequest request) {
        // Tìm user trong DB bằng accountId lấy từ JWT
        Account user = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Test test = modelMapper.map(request, Test.class);
        test.setUser(user);
        test.setNumberOfPeople(0);
        test.setStatus(Status.Draft);
        Test saved = testRepository.save(test);
        return toResponse(saved);
    }

    // ----------------- READ -----------------
    @Override
    public List<TestResponse> getAllTests() {
        return testRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }
    @Override
    public TestResponse getTestById(UUID id) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Test not found"));
        return toResponse(test);
    }


    @Override
    public List<TestResponse> getAllTestsSortedByCreateAt() {
        return testRepository.findAllByOrderByCreateAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TestResponse> getTestsBySkillName(String skillName) {
        return testRepository.findBySkillName(skillName)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TestResponse> searchTestsByTitle(String keyword) {
        return testRepository.findByTitleContainingIgnoreCase(keyword)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ----------------- UPDATE -----------------
    @Override
    public TestResponse updateTest(UUID testId, TestUpdateRequest request) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        if (request.getSkillName() != null) test.setSkillName(request.getSkillName());
        if (request.getTitle() != null) test.setTitle(request.getTitle());
        if (request.getNumberOfPeople() != null) test.setNumberOfPeople(request.getNumberOfPeople());
        if (request.getDurationSeconds() != null) test.setDurationSeconds(request.getDurationSeconds());
        test.setStatus(Status.Published);
        Test updated = testRepository.save(test);
        return toResponse(updated);
    }

    // ----------------- DELETE -----------------
    @Override
    public void deleteTest(UUID id) {
        if (!testRepository.existsById(id)) {
            throw new RuntimeException("Test not found");
        }
        testRepository.deleteById(id);
    }
    @Override
    public void deleteAllTestsByUserIdAndStatus(UUID userId, Status status) {
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Test> testsToDelete = testRepository.findByUser_IdAndStatus(userId, status);
        testRepository.deleteAll(testsToDelete);
    }

    @Override
    public TestResponse plusNumberOfMembers(UUID testId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        int current = test.getNumberOfPeople() == null ? 0 : test.getNumberOfPeople();
        test.setNumberOfPeople(current + 1);

        Test saved = testRepository.save(test);

        return toResponse(saved);
    }

    // ----------------- HELPER -----------------
    private TestResponse toResponse(Test test) {
        TestResponse response = modelMapper.map(test, TestResponse.class);
        if (test.getUser() != null) {
            response.setUserId(test.getUser().getId());
        }
        return response;
    }
}
