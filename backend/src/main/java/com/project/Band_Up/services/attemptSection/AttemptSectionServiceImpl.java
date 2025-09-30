package com.project.Band_Up.services.attemptSection;

import com.project.Band_Up.dtos.attemptSection.AttemptSectionCreateRequest;
import com.project.Band_Up.dtos.attemptSection.AttemptSectionResponse;
import com.project.Band_Up.entities.Attempt;
import com.project.Band_Up.entities.AttemptSection;
import com.project.Band_Up.entities.Section;
import com.project.Band_Up.repositories.AttemptRepository;
import com.project.Band_Up.repositories.AttemptSectionRepository;
import com.project.Band_Up.repositories.SectionRepository;
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
    public AttemptSectionResponse createAttemptSection(UUID attemptId, UUID sectionId, AttemptSectionCreateRequest request) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        AttemptSection attemptSection = modelMapper.map(request, AttemptSection.class);
        attemptSection.setAttempt(attempt);
        attemptSection.setSection(section);

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
