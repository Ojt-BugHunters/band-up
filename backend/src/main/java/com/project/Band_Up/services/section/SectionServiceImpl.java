package com.project.Band_Up.services.section;

import com.project.Band_Up.dtos.section.SectionCreateRequest;
import com.project.Band_Up.dtos.section.SectionResponse;
import com.project.Band_Up.dtos.section.SectionUpdateRequest;
import com.project.Band_Up.dtos.test.TestResponse;
import com.project.Band_Up.entities.Section;
import com.project.Band_Up.entities.Test;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.repositories.SectionRepository;
import com.project.Band_Up.repositories.TestRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SectionServiceImpl implements SectionService {

    private final SectionRepository sectionRepository;
    private final TestRepository testRepository;
    private final ModelMapper modelMapper;

    @Override
    public SectionResponse createSection(SectionCreateRequest request, UUID testId, UUID actorId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        UUID ownerId = test.getUser() != null ? test.getUser().getId() : null;
        if (ownerId != null && !ownerId.equals(actorId)) {
            throw new RuntimeException("Forbidden: you are not allowed to add section to this test");
        }

        Section section = modelMapper.map(request, Section.class);
        section.setStatus(Status.Draft);
        section.setTest(test);
        Section saved = sectionRepository.save(section);
        return toResponse(saved);
    }

    @Override
    public List<SectionResponse> createMultipleSections(List<SectionCreateRequest> request, UUID testId, UUID actorId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        UUID ownerId = test.getUser() != null ? test.getUser().getId() : null;
        if (ownerId != null && !ownerId.equals(actorId)) {
            throw new RuntimeException("Forbidden: you are not allowed to add section to this test");
        }

        List<Section> sections = request.stream().map(req -> {
            Section section = modelMapper.map(req, Section.class);
            section.setStatus(Status.Published);
            section.setTest(test);
            return section;
        }).toList();

        List<Section> savedSections = sectionRepository.saveAll(sections);

        return savedSections.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public SectionResponse getSectionById(UUID sectionId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        SectionResponse response = modelMapper.map(section, SectionResponse.class);
        response.setTestId(section.getTest().getId());
        return response;
    }

    @Override
    public List<SectionResponse> getSectionsByTestId(UUID testId) {
        List<Section> sections = sectionRepository.findAllByTest_IdOrderByOrderIndexAsc(testId);
        return sections.stream().map(section -> {
            SectionResponse response = modelMapper.map(section, SectionResponse.class);
            response.setTestId(section.getTest().getId());
            return response;
        }).toList();
    }

    @Override
    public SectionResponse updateSection(UUID id, SectionUpdateRequest request, UUID actorId) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        UUID ownerId = section.getTest().getUser() != null ? section.getTest().getUser().getId() : null;
        if (ownerId != null && !ownerId.equals(actorId)) {
            throw new RuntimeException("Forbidden: you are not allowed to update this section");
        }
        section.setTitle(request.getTitle());
        section.setOrderIndex(request.getOrderIndex());
        section.setStatus(Status.Published);
        section.setMetadata(request.getMetadata());

        Section updated = sectionRepository.save(section);
        return toResponse(updated);
    }

    @Override
    public void deleteSection(UUID id, UUID actorId) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        UUID ownerId = section.getTest().getUser() != null ? section.getTest().getUser().getId() : null;
        if (ownerId != null && !ownerId.equals(actorId)) {
            throw new RuntimeException("Forbidden: you are not allowed to add section to this test");
        }

        sectionRepository.deleteById(id);
    }

    @Override
    public void deleteAllDraftSections(UUID testId, Status status) {
        List<Section> sections = sectionRepository.findAllByTest_IdAndStatusOrderByOrderIndexAsc(testId, Status.Draft);
        sectionRepository.deleteAll(sections);
    }

    public SectionResponse toResponse(Section section) {
        SectionResponse response = modelMapper.map(section, SectionResponse.class);
        response.setTestId(section.getTest().getId());
        return response;
    }
}
