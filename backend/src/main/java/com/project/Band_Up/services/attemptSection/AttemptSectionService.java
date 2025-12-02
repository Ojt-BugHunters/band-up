package com.project.Band_Up.services.attemptSection;

import com.project.Band_Up.dtos.attemptSection.AttemptSectionCreateRequest;
import com.project.Band_Up.dtos.attemptSection.AttemptSectionResponse;
import com.project.Band_Up.enums.Status;

import java.util.List;
import java.util.UUID;

public interface AttemptSectionService {
    // Lấy tất cả attempt section theo attemptId
    List<AttemptSectionResponse> getAllAttemptSectionsByAttemptId(UUID attemptId);
    // Lấy attempt section theo attemptId và sectionId
    AttemptSectionResponse getAttemptSectionByAttemptIdAndSectionId(UUID attemptId, UUID sectionId);
    // Lấy attempt section theo attemptId và Status
    List<AttemptSectionResponse> getAttemptSectionsByAttemptIdAndStatus(UUID attemptId, Status status);
    // Tạo mới attempt section theo attemptId và sectionId
    AttemptSectionResponse createAttemptSection(UUID attemptId, UUID sectionId, AttemptSectionCreateRequest request);
    // Xóa attempt section theo attemptSectionId
    void deleteAttemptSection(UUID attemptSectionId);
    // Update status của 1 cái attempt section dựa trên attemptSectionId và status và nếu đó là cái attemptSection cuối cùng thì update luôn cả status của attempt
    AttemptSectionResponse updateAttemptSectionStatus(UUID attemptSectionId, Status status);
}
