package com.project.Band_Up.services.aiEvaluation;

import com.project.Band_Up.dtos.aiSpeaking.AiSpeakingRequest;
import com.project.Band_Up.dtos.aiSpeaking.AiSpeakingResponse;
import com.project.Band_Up.dtos.attempt.AttemptAiEvaluationsResponse;
import com.project.Band_Up.entities.AiEvaluation;

import java.util.UUID;

public interface SpeakingAiEvaluationService {


    AiSpeakingResponse evaluateAndSave(UUID answerId, AiSpeakingRequest speakingRequest);

    /**
     * Get AI evaluation by answer ID and parse JSON response
     *
     * @param answerId The ID of the answer
     * @return AiSpeakingResponse parsed from stored JSON
     */
    AiSpeakingResponse getEvaluationByAnswerId(UUID answerId);

    /**
     * Get raw AI evaluation entity by answer ID
     *
     * @param answerId The ID of the answer
     * @return AiEvaluation entity
     */
    AiEvaluation getEvaluationEntityByAnswerId(UUID answerId);

    /**
     * Get all AI evaluations for an attempt with answer content
     *
     * @param attemptId The ID of the attempt
     * @param userId The ID of the user (for ownership verification)
     * @return AttemptAiEvaluationsResponse containing all AI evaluations
     */
    AttemptAiEvaluationsResponse getAllEvaluationsByAttemptId(UUID attemptId, UUID userId);
}