package com.project.Band_Up.services.attempt;

import com.project.Band_Up.dtos.attempt.AttemptCreateRequest;
import com.project.Band_Up.dtos.attempt.AttemptResponse;
import com.project.Band_Up.dtos.attempt.AttemptUpdateRequest;
import com.project.Band_Up.enums.Status;

import java.util.List;
import java.util.UUID;

public interface AttemptService {
    // Lấy tất cả Attempt theo UserId
    List<AttemptResponse> getAllAttemptsByUserId(UUID userId);
    // Lấy tất cả Attempt theo UserId TestId
    List<AttemptResponse> getAllAttemptsByUserIdAndTestId(UUID userId, UUID testId);
    // Lấy Attempt theo AttemptId
    AttemptResponse getAttemptById(UUID attemptId);
    // Lấy Attempt theo UserId và status
    List<AttemptResponse> getAttemptsByUserIdAndStatus(UUID userId, Status status);
    // Tạo mới Attempt
    AttemptResponse createAttempt(UUID userId, UUID testId, AttemptCreateRequest createRequest);
    // Update Attempt
    AttemptResponse updateAttempt(UUID attemptId, UUID userId, AttemptUpdateRequest updateRequest);
    // Xóa Attempt
    void deleteAttempt(UUID attemptId, UUID userId);
}
