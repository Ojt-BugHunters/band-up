package com.project.Band_Up.services.section;

import com.project.Band_Up.dtos.section.SectionCreateRequest;
import com.project.Band_Up.dtos.section.SectionResponse;
import com.project.Band_Up.dtos.section.SectionUpdateRequest;
import com.project.Band_Up.enums.Status;

import java.util.List;
import java.util.UUID;

public interface SectionService {
    // Tạo một section mới cho một test cụ thể
    SectionResponse createSection(SectionCreateRequest request, UUID testId, UUID actorId);
    // Các phương thức khác như cập nhật, xóa, lấy section có thể được thêm vào đây
    SectionResponse getSectionById(UUID sectionId);
    // Lấy section theo testId
    List<SectionResponse> getSectionsByTestId(UUID testId);
    // Cập nhật section
    SectionResponse updateSection(UUID sectionId, SectionUpdateRequest request, UUID actorId);
    // Xóa section
    void deleteSection(UUID sectionId, UUID actorId);
    //xóa tất cả section theo status
    void deleteAllDraftSections(UUID testId, Status status);
}
