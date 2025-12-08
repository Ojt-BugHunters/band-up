package com.project.Band_Up.services.aiEvaluation;

import com.project.Band_Up.dtos.aiWriting.AiWritingResponse;
import com.project.Band_Up.dtos.aiWriting.AiWritingScoreRequest;

import java.util.UUID;

public interface WritingAiEvaluationService {

    /**
     * Evaluate writing essay using AI API and save to database
     *
     * @param request The writing evaluation request
     * @param answerId The ID of the answer to associate with the evaluation
     * @return AiWritingResponse containing evaluation results
     */
    AiWritingResponse evaluateAndSave(AiWritingScoreRequest request, UUID answerId);
}