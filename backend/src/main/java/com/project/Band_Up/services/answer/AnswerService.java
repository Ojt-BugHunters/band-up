package com.project.Band_Up.services.answer;

import com.project.Band_Up.dtos.answer.AnswerCreateRequest;
import com.project.Band_Up.dtos.answer.AnswerResponse;

import java.util.UUID;

public interface AnswerService {
    // Lấy ra answer theo  attemptSectionId và questionId
    AnswerResponse getAnswerByAttemptSectionIdAndQuestionId(UUID attemptSectionId, UUID questionId);
    AnswerResponse submitAnswer(UUID attemptSectionId, UUID questionId, AnswerCreateRequest request);
    void deleteAnswer(UUID attemptSectionId, UUID questionId);
}
