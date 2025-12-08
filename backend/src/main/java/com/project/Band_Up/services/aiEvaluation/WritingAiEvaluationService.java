package com.project.Band_Up.services.aiEvaluation;

import com.project.Band_Up.dtos.aiWriting.AiWritingResponse;
import com.project.Band_Up.dtos.aiWriting.AiWritingScoreRequest;
import com.project.Band_Up.dtos.attempt.AttemptAiEvaluationsResponse;
import com.project.Band_Up.entities.AiEvaluation;

import java.util.UUID;

public interface WritingAiEvaluationService {

    AiWritingResponse evaluateAndSave(AiWritingScoreRequest request, UUID answerId);


    AttemptAiEvaluationsResponse getAllEvaluationsByAttemptId(UUID attemptId, UUID userId);
}