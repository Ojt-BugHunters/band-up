package com.project.Band_Up.services.answer;

import com.project.Band_Up.dtos.answer.AnswerCreateRequest;
import com.project.Band_Up.dtos.answer.DictationAnswerResponse;
import com.project.Band_Up.dtos.answer.IeltsAnswerResponse;

import java.util.UUID;

public interface AnswerService {
    // Lấy ra answer theo  attemptSectionId và questionId
    DictationAnswerResponse getAnswerByAttemptSectionIdAndQuestionId(UUID attemptSectionId, UUID questionId);
//    DictationAnswerResponse submitAnswer(UUID attemptSectionId, UUID questionId, AnswerCreateRequest request);
//    IeltsAnswerResponse submitIeltsAnswer(UUID attemptSectionId, UUID questionId, AnswerCreateRequest request);
    void deleteAnswer(UUID attemptSectionId, UUID questionId);
}
