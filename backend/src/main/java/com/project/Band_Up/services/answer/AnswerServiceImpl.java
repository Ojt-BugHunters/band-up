package com.project.Band_Up.services.answer;

import com.project.Band_Up.dtos.answer.AnswerResponse;
import com.project.Band_Up.entities.Answer;
import com.project.Band_Up.entities.AttemptSection;
import com.project.Band_Up.entities.Question;
import com.project.Band_Up.repositories.AnswerRepository;
import com.project.Band_Up.repositories.AttemptSectionRepository;
import com.project.Band_Up.repositories.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnswerServiceImpl implements AnswerService {
    private final AnswerRepository answerRepository;
    private final AttemptSectionRepository attemptSectionRepository;
    private final QuestionRepository questionRepository;
    private final ModelMapper modelMapper;

    @Override
    public AnswerResponse getAnswerByAttemptSectionIdAndQuestionId(UUID attemptSectionId, UUID questionId) {
        // ensure attemptSection exists
        AttemptSection attemptSection = attemptSectionRepository.findById(attemptSectionId)
                .orElseThrow(() -> new RuntimeException("AttemptSection not found"));

        // ensure question exists
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // find answer
        Answer answer = answerRepository.findByAttemptSection_IdAndQuestion_Id(attemptSectionId, questionId);
        if (answer == null) {
            throw new RuntimeException("Answer not found");
        }

        // map to DTO and return
        return modelMapper.map(answer, AnswerResponse.class);
    }
}
