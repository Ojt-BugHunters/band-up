package com.project.Band_Up.services.aiEvaluation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Band_Up.configs.AiWritingConfig;
import com.project.Band_Up.dtos.aiWriting.AiWritingResponse;
import com.project.Band_Up.dtos.aiWriting.AiWritingScoreRequest;
import com.project.Band_Up.entities.AiEvaluation;
import com.project.Band_Up.entities.Answer;
import com.project.Band_Up.enums.EvalType;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AiEvaluationRepository;
import com.project.Band_Up.repositories.AnswerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WritingAiEvaluationServiceImpl implements WritingAiEvaluationService {

    private final AiWritingConfig aiWritingConfig;
    private final AiEvaluationRepository aiEvaluationRepository;
    private final AnswerRepository answerRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public AiWritingResponse evaluateAndSave(AiWritingScoreRequest request, UUID answerId) {
        log.info("Starting writing evaluation for answer ID: {}", answerId);

        // 1. Validate answer exists
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found with ID: " + answerId));

        try {
            // 2. Call AI API
            AiWritingResponse aiResponse = callAiWritingApi(request);
            log.info("Successfully received AI evaluation response for answer ID: {}", answerId);

            // 3. Save to database
            saveAiEvaluation(answer, aiResponse);
            log.info("Successfully saved AI evaluation for answer ID: {}", answerId);

            return aiResponse;

        } catch (Exception e) {
            log.error("Error during writing evaluation for answer ID: {}", answerId, e);
            throw new RuntimeException("Failed to evaluate writing: " + e.getMessage(), e);
        }
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