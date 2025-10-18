package com.project.Band_Up.services.question;

import com.project.Band_Up.dtos.question.QuestionCreateRequest;
import com.project.Band_Up.dtos.question.QuestionResponse;
import com.project.Band_Up.dtos.question.QuestionUpdateRequest;
import com.project.Band_Up.dtos.test.TestResponse;
import com.project.Band_Up.entities.Question;
import com.project.Band_Up.entities.Section;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.repositories.QuestionRepository;
import com.project.Band_Up.repositories.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {
    private final ModelMapper modelMapper;
    private final QuestionRepository questionRepository;
    private final SectionRepository sectionRepository;
    @Override
    public QuestionResponse createQuestion(UUID sectionId, QuestionCreateRequest request) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new IllegalArgumentException("Section not found"));
        Question question = modelMapper.map(request, Question.class);
        question.setSection(section);
        question.setStatus(Status.Draft);
        Question saved = questionRepository.save(question);
        return toResponse(saved);
    }
    @Override
    public List<QuestionResponse> getAllQuestionsBySectionId(UUID sectionId) {
        List<Question> questions = questionRepository.findAllBySection_Id(sectionId);
        return questions.stream().map(this::toResponse).toList();
    }
    @Override
    public QuestionResponse updateQuestionById(UUID questionId, QuestionUpdateRequest request){
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
        modelMapper.map(request, question);
        question.setStatus(Status.Published);
        Question updated = questionRepository.save(question);
        return toResponse(updated);
    }
    @Override
    public void deleteQuestionById(UUID questionId){
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
        questionRepository.delete(question);
    }
    private QuestionResponse toResponse(Question question) {
        QuestionResponse response = modelMapper.map(question, QuestionResponse.class);
        if(question.getSection() != null) {
            response.setSectionId(question.getSection().getId());
        }
        return response;
    }
}
