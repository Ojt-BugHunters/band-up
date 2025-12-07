package com.project.Band_Up.services.attemptSection;

import com.project.Band_Up.dtos.attemptSection.AttemptSectionCreateRequest;
import com.project.Band_Up.dtos.attemptSection.AttemptSectionResponse;
import com.project.Band_Up.entities.*;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.repositories.*;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttemptSectionServiceImpl implements AttemptSectionService {
    private final AttemptSectionRepository attemptSectionRepository;
    private final AttemptRepository attemptRepository;
    private final SectionRepository sectionRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<AttemptSectionResponse> getAllAttemptSectionsByAttemptId(UUID attemptId) {
        // ensure attempt exists
        attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        List<AttemptSection> list = attemptSectionRepository.findAllByAttempt_IdOrderByStartAtDesc(attemptId);
        return list.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AttemptSectionResponse getAttemptSectionByAttemptIdAndSectionId(UUID attemptId, UUID sectionId) {
        AttemptSection attemptSection = attemptSectionRepository.findByAttempt_IdAndSection_Id(attemptId, sectionId);
        if (attemptSection == null) {
            throw new RuntimeException("AttemptSection not found");
        }
        return toResponse(attemptSection);
    }
    @Override
    public List<AttemptSectionResponse> getAttemptSectionsByAttemptIdAndStatus(UUID attemptId, Status status){
        List<AttemptSection> attemptSection = attemptSectionRepository.findAllByAttempt_IdAndStatus(attemptId, status);
        if (attemptSection.isEmpty()) {
            throw new RuntimeException("AttemptSection not found");
        }
        return attemptSection.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    @Override
    public AttemptSectionResponse updateAttemptSectionStatus(UUID attemptSectionId, Status status) {
        AttemptSection attemptSection = attemptSectionRepository.findById(attemptSectionId)
                .orElseThrow(() -> new RuntimeException("AttemptSection not found"));

        Attempt attempt = attemptSection.getAttempt();
        if (attempt == null) {
            throw new RuntimeException("Attempt not found for this AttemptSection");
        }
        attemptSection.setStatus(status);
        AttemptSection updated = attemptSectionRepository.save(attemptSection);
        recalculateAttemptStatus(attempt);
        return toResponse(updated);
    }

    private void recalculateAttemptStatus(Attempt attempt) {
        List<AttemptSection> sections =
                attemptSectionRepository.findAllByAttempt_IdOrderByStartAtDesc(attempt.getId());
        boolean hasOngoing = sections.stream()
                .anyMatch(s -> s.getStatus() == Status.ONGOING);
        boolean allEnded = !sections.isEmpty() && sections.stream()
                .allMatch(s -> s.getStatus() == Status.ENDED);
        if (hasOngoing) {
            attempt.setStatus(Status.ONGOING);
        } else if (allEnded) {
            attempt.setStatus(Status.ENDED);
        } else {
            attempt.setStatus(Status.PENDING);
        }
        attemptRepository.save(attempt);
    }


    @Override
    public AttemptSectionResponse createAttemptSection(UUID attemptId, UUID sectionId, AttemptSectionCreateRequest request) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        AttemptSection attemptSection = modelMapper.map(request, AttemptSection.class);
        attemptSection.setAttempt(attempt);
        attemptSection.setSection(section);
        attemptSection.setStatus(Status.ONGOING);
        AttemptSection saved = attemptSectionRepository.save(attemptSection);
        return toResponse(saved);
    }


    @Override
    public void deleteAttemptSection(UUID attemptSectionId) {
        AttemptSection attemptSection = attemptSectionRepository.findById(attemptSectionId)
                .orElseThrow(() -> new RuntimeException("AttemptSection not found"));
        attemptSectionRepository.delete(attemptSection);
    }

    // helper map AttemptSection -> AttemptSectionResponse and populate attemptId/sectionId
    private AttemptSectionResponse toResponse(AttemptSection attemptSection) {
        AttemptSectionResponse resp = modelMapper.map(attemptSection, AttemptSectionResponse.class);

        if (attemptSection.getAttempt() != null) {
            resp.setAttemptId(attemptSection.getAttempt().getId());
        }
        if (attemptSection.getSection() != null) {
            resp.setSectionId(attemptSection.getSection().getId());
        }

        return resp;
    }
}
