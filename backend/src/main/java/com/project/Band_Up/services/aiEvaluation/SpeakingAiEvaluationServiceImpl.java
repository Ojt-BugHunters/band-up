package com.project.Band_Up.services.aiEvaluation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Band_Up.configs.AiSpeakingConfig;
import com.project.Band_Up.dtos.aiSpeaking.AiSpeakingRequest;
import com.project.Band_Up.dtos.aiSpeaking.AiSpeakingResponse;
import com.project.Band_Up.dtos.aiWriting.AiEvaluationDetailResponse;
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
public class SpeakingAiEvaluationServiceImpl implements SpeakingAiEvaluationService {

    private final AiSpeakingConfig aiSpeakingConfig;
    private final AiEvaluationRepository aiEvaluationRepository;
    private final AnswerRepository answerRepository;
    private final AttemptRepository attemptRepository;
    private final AttemptSectionRepository attemptSectionRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public AiSpeakingResponse evaluateAndSave(UUID answerId, AiSpeakingRequest requestInput) {
        log.info("Starting speaking evaluation for answer ID: {}", answerId);

        // 1. Validate answer exists
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found with ID: " + answerId));

        // 2. Validate s3AudioUrl exists
        if (answer.getS3AudioUrl() == null || answer.getS3AudioUrl().isEmpty()) {
            throw new RuntimeException("Audio URL not found for answer ID: " + answerId);
        }

        // Get attempt info
        AttemptSection attemptSection = answer.getAttemptSection();
        Attempt attempt = attemptSection.getAttempt();
        UUID attemptId = attempt.getId();

        log.info("Attempt ID: {}", attemptId);
        log.info("Current attempt status: {}", attempt.getStatus());
        log.info("Audio URL: {}", answer.getS3AudioUrl());
        String taskType = requestInput.getTaskType();
        log.info("Task Type: {}", taskType);

        try {
            // 3. Build request
            AiSpeakingRequest request = AiSpeakingRequest.builder()
                    .sessionId(answerId) // Use answerId as session_id
                    .userId(attempt.getUser().getId())
                    .audioUrl(answer.getS3AudioUrl())
                    .taskType(taskType)
                    .prompt(requestInput.getPrompt())
                    .durationSeconds(requestInput.getDurationSeconds())
                    .build();

            // 4. Call AI API
            AiSpeakingResponse aiResponse = callAiSpeakingApi(request);
            log.info("Successfully received AI evaluation response for answer ID: {}", answerId);

            // 5. Save to database
            saveAiEvaluation(answer, aiResponse);
            log.info("Successfully saved AI evaluation for answer ID: {}", answerId);

            // 6. Check if this is the 3rd speaking part and update attempt status
            checkAndUpdateAttemptStatus(attemptId);

            return aiResponse;

        } catch (Exception e) {
            log.error("Error during speaking evaluation for answer ID: {}", answerId, e);
            throw new RuntimeException("Failed to evaluate speaking: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AiSpeakingResponse getEvaluationByAnswerId(UUID answerId) {
        log.info("Getting AI speaking evaluation for answer ID: {}", answerId);

        AiEvaluation evaluation = getEvaluationEntityByAnswerId(answerId);

        try {
            // Parse JSON string to AiSpeakingResponse object
            AiSpeakingResponse response = objectMapper.readValue(
                    evaluation.getAiResponse(),
                    AiSpeakingResponse.class
            );
            log.info("Successfully parsed AI speaking evaluation for answer ID: {}", answerId);
            return response;

        } catch (Exception e) {
            log.error("Error parsing AI speaking evaluation JSON for answer ID: {}", answerId, e);
            throw new RuntimeException("Failed to parse AI speaking evaluation: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AiEvaluation getEvaluationEntityByAnswerId(UUID answerId) {
        log.info("Getting AI speaking evaluation entity for answer ID: {}", answerId);

        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found with ID: " + answerId));

        return aiEvaluationRepository.findByAnswer(answer)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "AI speaking evaluation not found for answer ID: " + answerId));
    }

    @Override
    @Transactional(readOnly = true)
    public AttemptAiEvaluationsResponse getAllEvaluationsByAttemptId(UUID attemptId, UUID userId) {
        log.info("========== GET ALL AI SPEAKING EVALUATIONS BY ATTEMPT START ==========");
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

        // 3. Lấy tất cả AI Evaluations của attempt này (chỉ SPEAKING)
        List<AiEvaluation> allEvaluations = aiEvaluationRepository.findAllByAttemptId(attemptId).stream()
                .filter(eval -> eval.getEvalType() == EvalType.SPEAKING)
                .collect(Collectors.toList());
        log.info("Total AI Speaking Evaluations found: {}", allEvaluations.size());

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

            log.info("AI Speaking Evaluations in this section: {}", sectionEvaluations.size());

            // Convert to response DTOs
            List<AiEvaluationDetailResponse> evaluationDetails = new ArrayList<>();

            for (AiEvaluation evaluation : sectionEvaluations) {
                try {
                    // Parse JSON string to AiSpeakingResponse
                    AiSpeakingResponse aiResponse = objectMapper.readValue(
                            evaluation.getAiResponse(),
                            AiSpeakingResponse.class
                    );

                    log.info("Processing AI Speaking Evaluation ID: {}", evaluation.getId());
                    log.info("Answer ID: {}", evaluation.getAnswer().getId());
                    log.info("Audio URL: {}", evaluation.getAnswer().getS3AudioUrl());

                    AiEvaluationDetailResponse detailResponse = AiEvaluationDetailResponse.builder()
                            .aiEvaluationId(evaluation.getId())
                            .answerId(evaluation.getAnswer().getId())
                            .attemptSectionId(attemptSection.getId())
                            .answerContent(evaluation.getAnswer().getS3AudioUrl()) // Audio URL as content
                            .evalType(evaluation.getEvalType())
                            .aiResponse(aiResponse) // This will need a generic type in DTO
                            .overallBand(evaluation.getOverallBand())
                            .createdAt(evaluation.getCreatedAt())
                            .build();

                    evaluationDetails.add(detailResponse);

                } catch (Exception e) {
                    log.error("Error parsing AI speaking evaluation JSON for ID: {}", evaluation.getId(), e);
                    // Skip this evaluation if parsing fails
                }
            }

            // Create section response only if has evaluations
            if (!evaluationDetails.isEmpty()) {
                AttemptSectionAiEvaluationResponse sectionResponse = AttemptSectionAiEvaluationResponse.builder()
                        .attemptSectionId(attemptSection.getId())
                        .sectionId(attemptSection.getSection().getId())
                        .sectionTitle(attemptSection.getSection().getTitle())
                        .aiEvaluations(evaluationDetails)
                        .build();

                sectionResponses.add(sectionResponse);
            }
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
        log.info("Total sections with speaking evaluations: {}", sectionResponses.size());
        log.info("Total speaking evaluations: {}", allEvaluations.size());
        log.info("========== GET ALL AI SPEAKING EVALUATIONS BY ATTEMPT END ==========\n");

        return response;
    }

    private AiSpeakingResponse callAiSpeakingApi(AiSpeakingRequest request) {
        try {
            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-api-key", aiSpeakingConfig.getApiKey());
            headers.set("Content-Type", "application/json");

            // Debug logging
            log.debug("API URL: {}", aiSpeakingConfig.getApiUrl());
            log.debug("API Key (first 10 chars): {}...",
                    aiSpeakingConfig.getApiKey() != null ?
                            aiSpeakingConfig.getApiKey().substring(0, Math.min(10, aiSpeakingConfig.getApiKey().length())) : "NULL");
            log.debug("Request - Audio URL: {}", request.getAudioUrl());
            log.debug("Request - Task Type: {}", request.getTaskType());

            // Create request entity
            HttpEntity<AiSpeakingRequest> requestEntity = new HttpEntity<>(request, headers);

            // Call API
            log.info("Calling AI Speaking API...");
            ResponseEntity<AiSpeakingResponse> response = restTemplate.exchange(
                    aiSpeakingConfig.getApiUrl(),
                    HttpMethod.POST,
                    requestEntity,
                    AiSpeakingResponse.class
            );

            if (response.getBody() == null) {
                throw new RuntimeException("AI API returned null response");
            }

            log.info("AI Speaking API call successful. Status: {}", response.getStatusCode());
            return response.getBody();

        } catch (Exception e) {
            log.error("Error calling AI Speaking API", e);
            throw new RuntimeException("Failed to call AI Speaking API: " + e.getMessage(), e);
        }
    }

    private void saveAiEvaluation(Answer answer, AiSpeakingResponse aiResponse) {
        try {
            // Convert response to JSON string for storage
            String jsonResponseString = objectMapper.writeValueAsString(aiResponse);

            // Create AiEvaluation entity
            AiEvaluation aiEvaluation = AiEvaluation.builder()
                    .answer(answer)
                    .evalType(EvalType.SPEAKING)
                    .aiResponse(jsonResponseString)
                    .overallBand(aiResponse.getOverallBand())
                    .build();

            // Save to database
            aiEvaluationRepository.save(aiEvaluation);
            log.info("Saved AI speaking evaluation with overall band: {}", aiResponse.getOverallBand());

        } catch (Exception e) {
            log.error("Error saving AI speaking evaluation to database", e);
            throw new RuntimeException("Failed to save AI speaking evaluation: " + e.getMessage(), e);
        }
    }

    /**
     * Check if all 3 speaking parts are evaluated and update attempt status to ENDED
     * Speaking test có 3 parts: PART_1, PART_2, PART_3
     */
    private void checkAndUpdateAttemptStatus(UUID attemptId) {
        log.info("Checking if all speaking parts are evaluated for attempt: {}", attemptId);

        // Get all SPEAKING evaluations for this attempt
        List<AiEvaluation> evaluations = aiEvaluationRepository.findAllByAttemptId(attemptId).stream()
                .filter(eval -> eval.getEvalType() == EvalType.SPEAKING)
                .collect(Collectors.toList());
        log.info("Total AI Speaking evaluations found: {}", evaluations.size());

        // Speaking test có 3 parts
        if (evaluations.size() >= 3) {
            log.info("All 3 speaking parts have been evaluated. Updating attempt status to ENDED.");

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
            log.info("Only {} part(s) evaluated so far. Waiting for all 3 parts to complete.", evaluations.size());
        }
    }
}