package com.project.Band_Up.services.answer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Band_Up.dtos.answer.AnswerCreateRequest;
import com.project.Band_Up.dtos.answer.DictationAnswerResponse;
import com.project.Band_Up.dtos.answer.IeltsAnswerResponse;
import com.project.Band_Up.entities.Answer;
import com.project.Band_Up.entities.AttemptSection;
import com.project.Band_Up.entities.Question;
import com.project.Band_Up.repositories.AnswerRepository;
import com.project.Band_Up.repositories.AttemptSectionRepository;
import com.project.Band_Up.repositories.QuestionRepository;
import com.project.Band_Up.repositories.TestRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@RequiredArgsConstructor
@Transactional
public abstract class AbstractAnswerServiceImpl implements AnswerService {

    protected final AnswerRepository answerRepository;
    protected final AttemptSectionRepository attemptSectionRepository;
    protected final QuestionRepository questionRepository;
    protected final ModelMapper modelMapper;
    protected final ObjectMapper objectMapper;


    @Override
    public DictationAnswerResponse getAnswerByAttemptSectionIdAndQuestionId(UUID attemptSectionId, UUID questionId) {
        Answer answer = answerRepository
                .findByAttemptSection_IdAndQuestion_Id(attemptSectionId, questionId);
        if (answer == null) {
            throw new RuntimeException("Answer not found");
        }
        return modelMapper.map(answer, DictationAnswerResponse.class);
    }

    @Override
    public void deleteAnswer(UUID attemptSectionId, UUID questionId) {
        Answer answer = answerRepository
                .findByAttemptSection_IdAndQuestion_Id(attemptSectionId, questionId);
        if (answer == null) {
            throw new RuntimeException("Answer not found");
        }
        answerRepository.delete(answer);
    }



//    public abstract DictationAnswerResponse submitAnswer(UUID attemptSectionId, UUID questionId, AnswerCreateRequest request);
//    public abstract IeltsAnswerResponse submitIeltsAnswer(UUID attemptSectionId, UUID questionId, AnswerCreateRequest request);

    // Hàm tiện ích dùng chung
    protected AttemptSection getAttemptSection(UUID attemptSectionId) {
        return attemptSectionRepository.findById(attemptSectionId)
                .orElseThrow(() -> new RuntimeException("AttemptSection not found"));
    }


    protected Question getQuestion(UUID questionId) {
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
    }
}
