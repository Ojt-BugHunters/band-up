package com.project.Band_Up.services.aiEvaluation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Band_Up.configs.AiWritingConfig;
import com.project.Band_Up.dtos.aiWriting.AiEvaluationDetailResponse;
import com.project.Band_Up.dtos.aiWriting.AiWritingResponse;
import com.project.Band_Up.dtos.aiWriting.AiWritingScoreRequest;
import com.project.Band_Up.dtos.attempt.AttemptAiEvaluationsResponse;
import com.project.Band_Up.dtos.attemptSection.AttemptSectionAiEvaluationResponse;
import com.project.Band_Up.entities.AiEvaluation;
import com.project.Band_Up.entities.Answer;
import com.project.Band_Up.entities.Attempt;
import com.project.Band_Up.entities.AttemptSection;
import com.project.Band_Up.enums.EvalType;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AiEvaluationRepository;
import com.project.Band_Up.repositories.AnswerRepository;
import com.project.Band_Up.repositories.AttemptRepository;
import com.project.Band_Up.repositories.AttemptSectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WritingAiEvaluationServiceImpl implements WritingAiEvaluationService {

    private final AiWritingConfig aiWritingConfig;
    private final AiEvaluationRepository aiEvaluationRepository;
    private final AnswerRepository answerRepository;
    private final AttemptRepository attemptRepository;
    private final AttemptSectionRepository attemptSectionRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public AiWritingResponse evaluateAndSave(AiWritingScoreRequest request, UUID answerId) {
        log.info("Starting writing evaluation for answer ID: {}", answerId);

        // 1. Validate answer exists
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found with ID: " + answerId));

        // Get attempt info
        AttemptSection attemptSection = answer.getAttemptSection();
        Attempt attempt = attemptSection.getAttempt();
        UUID attemptId = attempt.getId();

        log.info("Attempt ID: {}", attemptId);
        log.info("Current attempt status: {}", attempt.getStatus());

        try {
            // 2. Call AI API
            AiWritingResponse aiResponse = callAiWritingApi(request);
            log.info("Successfully received AI evaluation response for answer ID: {}", answerId);

            // 3. Save to database
            saveAiEvaluation(answer, aiResponse);
            log.info("Successfully saved AI evaluation for answer ID: {}", answerId);

            // 4. Check if this is the 2nd writing task and update attempt status
            checkAndUpdateAttemptStatus(attemptId);

            return aiResponse;

        } catch (Exception e) {
            log.error("Error during writing evaluation for answer ID: {}", answerId, e);
            throw new RuntimeException("Failed to evaluate writing: " + e.getMessage(), e);
        }
    }

    /**
     * Check if both writing tasks are evaluated and update attempt status to ENDED
     */
    private void checkAndUpdateAttemptStatus(UUID attemptId) {
        log.info("Checking if all writing tasks are evaluated for attempt: {}", attemptId);

        // Get all AI evaluations for this attempt
        List<AiEvaluation> evaluations = aiEvaluationRepository.findAllByAttemptId(attemptId);
        log.info("Total AI evaluations found: {}", evaluations.size());

        // Writing test có 2 tasks
        if (evaluations.size() >= 2) {
            log.info("Both writing tasks have been evaluated. Updating attempt status to ENDED.");

            Attempt attempt = attemptRepository.findById(attemptId)
                    .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with ID: " + attemptId));

            // Update attempt status to ENDED
            attempt.setStatus(Status.ENDED);

            // Update all attempt sections to ENDED
            List<AttemptSection> attemptSections = attemptSectionRepository.findByAttemptId(attemptId);
            attemptSections.forEach(section -> section.setStatus(Status.ENDED));

            // Save changes
            attemptRepository.save(attempt);
            attemptSectionRepository.saveAll(attemptSections);

            log.info("Successfully updated attempt {} status to ENDED", attemptId);
        } else {
            log.info("Only {} task(s) evaluated so far. Waiting for all tasks to complete.", evaluations.size());
        }
    }


    @Transactional(readOnly = true)
    public AiWritingResponse getEvaluationByAnswerId(UUID answerId) {
        log.info("Getting AI evaluation for answer ID: {}", answerId);

        AiEvaluation evaluation = getEvaluationEntityByAnswerId(answerId);

        try {
            // Parse JSON string to AiWritingResponse object
            AiWritingResponse response = objectMapper.readValue(
                    evaluation.getAiResponse(),
                    AiWritingResponse.class
            );
            log.info("Successfully parsed AI evaluation for answer ID: {}", answerId);
            return response;

        } catch (Exception e) {
            log.error("Error parsing AI evaluation JSON for answer ID: {}", answerId, e);
            throw new RuntimeException("Failed to parse AI evaluation: " + e.getMessage(), e);
        }
    }


    @Transactional(readOnly = true)
    public AiEvaluation getEvaluationEntityByAnswerId(UUID answerId) {
        log.info("Getting AI evaluation entity for answer ID: {}", answerId);

        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found with ID: " + answerId));

        return aiEvaluationRepository.findByAnswer(answer)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "AI evaluation not found for answer ID: " + answerId));
    }

    @Override
    @Transactional(readOnly = true)
    public AttemptAiEvaluationsResponse getAllEvaluationsByAttemptId(UUID attemptId, UUID userId) {
        log.info("========== GET ALL AI EVALUATIONS BY ATTEMPT START ==========");
        log.info("Attempt ID: {}", attemptId);
        log.info("User ID: {}", userId);

        // 1. Lấy Attempt và kiểm tra quyền sở hữu
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with ID: " + attemptId));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not the owner of this attempt");
        }

        // 2. Kiểm tra attempt đã ENDED chưa
        if (attempt.getStatus() != Status.ENDED) {
            throw new RuntimeException("Attempt has not been submitted yet. Status: " + attempt.getStatus());
        }

        log.info("Attempt status: {}", attempt.getStatus());
        log.info("Test ID: {}", attempt.getTest().getId());
        log.info("Test Title: {}", attempt.getTest().getTitle());

        // 3. Lấy tất cả AI Evaluations của attempt này
        List<AiEvaluation> allEvaluations = aiEvaluationRepository.findAllByAttemptId(attemptId);
        log.info("Total AI Evaluations found: {}", allEvaluations.size());

        // 4. Lấy tất cả AttemptSections của attempt
        List<AttemptSection> attemptSections = attemptSectionRepository.findByAttemptId(attemptId);
        log.info("Total AttemptSections: {}", attemptSections.size());

        // 5. Group evaluations by attemptSection
        List<AttemptSectionAiEvaluationResponse> sectionResponses = new ArrayList<>();

        for (AttemptSection attemptSection : attemptSections) {
            log.info("\n--- Processing AttemptSection: {} ---", attemptSection.getId());
            log.info("Section ID: {}", attemptSection.getSection().getId());
            log.info("Section Title: {}", attemptSection.getSection().getTitle());

            // Filter evaluations for this attemptSection
            List<AiEvaluation> sectionEvaluations = allEvaluations.stream()
                    .filter(eval -> eval.getAnswer().getAttemptSection().getId().equals(attemptSection.getId()))
                    .collect(Collectors.toList());

            log.info("AI Evaluations in this section: {}", sectionEvaluations.size());

            // Convert to response DTOs
            List<AiEvaluationDetailResponse> evaluationDetails = new ArrayList<>();

            for (AiEvaluation evaluation : sectionEvaluations) {
                try {
                    // Parse JSON string to AiWritingResponse
                    AiWritingResponse aiResponse = objectMapper.readValue(
                            evaluation.getAiResponse(),
                            AiWritingResponse.class
                    );

                    log.info("Processing AI Evaluation ID: {}", evaluation.getId());
                    log.info("Answer ID: {}", evaluation.getAnswer().getId());
                    log.info("Answer content length: {}",
                            evaluation.getAnswer().getAnswerContent() != null ?
                                    evaluation.getAnswer().getAnswerContent().length() : 0);

                    AiEvaluationDetailResponse detailResponse = AiEvaluationDetailResponse.builder()
                            .aiEvaluationId(evaluation.getId())
                            .answerId(evaluation.getAnswer().getId())
                            .attemptSectionId(attemptSection.getId())
                            .answerContent(evaluation.getAnswer().getAnswerContent())
                            .evalType(evaluation.getEvalType())
                            .aiResponse(aiResponse)
                            .overallBand(evaluation.getOverallBand())
                            .createdAt(evaluation.getCreatedAt())
                            .build();

                    evaluationDetails.add(detailResponse);

                } catch (Exception e) {
                    log.error("Error parsing AI evaluation JSON for ID: {}", evaluation.getId(), e);
                    // Skip this evaluation if parsing fails
                }
            }

            // Create section response
            AttemptSectionAiEvaluationResponse sectionResponse = AttemptSectionAiEvaluationResponse.builder()
                    .attemptSectionId(attemptSection.getId())
                    .sectionId(attemptSection.getSection().getId())
                    .sectionTitle(attemptSection.getSection().getTitle())
                    .aiEvaluations(evaluationDetails)
                    .build();

            sectionResponses.add(sectionResponse);
        }

        // 6. Build final response
        AttemptAiEvaluationsResponse response = AttemptAiEvaluationsResponse.builder()
                .attemptId(attempt.getId())
                .testId(attempt.getTest().getId())
                .testTitle(attempt.getTest().getTitle())
                .testSkillName(attempt.getTest().getSkillName())
                .totalScore(attempt.getScore())
                .overallBand(attempt.getOverallBand())
                .attemptSections(sectionResponses)
                .build();

        log.info("\n========== SUMMARY ==========");
        log.info("Total sections with evaluations: {}", sectionResponses.size());
        log.info("Total evaluations: {}", allEvaluations.size());
        log.info("========== GET ALL AI EVALUATIONS BY ATTEMPT END ==========\n");

        return response;
    }

    private AiWritingResponse callAiWritingApi(AiWritingScoreRequest request) {
        try {
            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-api-key", aiWritingConfig.getApiKey());
            headers.set("Content-Type", "application/json");

            // Create request entity
            HttpEntity<AiWritingScoreRequest> requestEntity = new HttpEntity<>(request, headers);

            // Call API
            log.debug("Calling AI Writing API at: {}", aiWritingConfig.getApiUrl());
            ResponseEntity<AiWritingResponse> response = restTemplate.exchange(
                    aiWritingConfig.getApiUrl(),
                    HttpMethod.POST,
                    requestEntity,
                    AiWritingResponse.class
            );

            if (response.getBody() == null) {
                throw new RuntimeException("AI API returned null response");
            }

            return response.getBody();

        } catch (Exception e) {
            log.error("Error calling AI Writing API", e);
            throw new RuntimeException("Failed to call AI Writing API: " + e.getMessage(), e);
        }
    }

    private void saveAiEvaluation(Answer answer, AiWritingResponse aiResponse) {
        try {
            // Convert response to JSON string for storage
            String jsonResponseString = objectMapper.writeValueAsString(aiResponse);

            // Create AiEvaluation entity
            AiEvaluation aiEvaluation = AiEvaluation.builder()
                    .answer(answer)
                    .evalType(EvalType.WRITING)
                    .aiResponse(jsonResponseString)
                    .overallBand(aiResponse.getOverallBand())
                    .build();

            // Save to database
            aiEvaluationRepository.save(aiEvaluation);
            log.info("Saved AI evaluation with overall band: {}", aiResponse.getOverallBand());

        } catch (Exception e) {
            log.error("Error saving AI evaluation to database", e);
            throw new RuntimeException("Failed to save AI evaluation: " + e.getMessage(), e);
        }
    }
}