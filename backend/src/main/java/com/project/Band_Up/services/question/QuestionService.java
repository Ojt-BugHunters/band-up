package com.project.Band_Up.services.question;

import com.project.Band_Up.dtos.question.QuestionCreateRequest;
import com.project.Band_Up.dtos.question.QuestionResponse;
import com.project.Band_Up.dtos.question.QuestionUpdateRequest;

import java.util.List;
import java.util.UUID;

public interface QuestionService {
    QuestionResponse createQuestion(UUID sectionId, QuestionCreateRequest request);
    List<QuestionResponse> getAllQuestionsBySectionId(UUID sectionId);
    QuestionResponse updateQuestionById(UUID questionId, QuestionUpdateRequest request);
    void deleteQuestionById(UUID questionId);
}
