package com.project.Band_Up.services.answer;

import com.project.Band_Up.dtos.answer.AnswerCreateRequest;
import com.project.Band_Up.dtos.answer.AnswerResponse;
import com.project.Band_Up.dtos.answer.MistakeDetailDto;
import com.project.Band_Up.entities.Answer;
import com.project.Band_Up.entities.AttemptSection;
import com.project.Band_Up.entities.Question;
import com.project.Band_Up.enums.DictationMistake;
import com.project.Band_Up.repositories.AnswerRepository;
import com.project.Band_Up.repositories.AttemptSectionRepository;
import com.project.Band_Up.repositories.QuestionRepository;
import com.project.Band_Up.services.answer.AbstractAnswerServiceImpl;
import lombok.RequiredArgsConstructor;
import org.apache.commons.text.similarity.LevenshteinDistance;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import difflib.Delta;
import difflib.Delta.TYPE;
import difflib.DiffUtils;
import difflib.Patch;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DictationAnswerServiceImpl extends AbstractAnswerServiceImpl {

    public DictationAnswerServiceImpl(
            AnswerRepository answerRepository,
            AttemptSectionRepository attemptSectionRepository,
            QuestionRepository questionRepository,
            ModelMapper modelMapper
    ) {
        super(answerRepository, attemptSectionRepository, questionRepository, modelMapper);
    }

    @Override
    public AnswerResponse submitAnswer(UUID attemptSectionId, UUID questionId, AnswerCreateRequest request) {
        AttemptSection attemptSection = getAttemptSection(attemptSectionId);
        Question question = getQuestion(questionId);

        // Lấy script và câu người dùng nhập, chuẩn hóa
        String correctText = normalizeText(question.getScript());
        String userText = normalizeText(request.getAnswerContent());

        List<String> correctTokens = Arrays.asList(correctText.split(" "));
        List<String> userTokens = Arrays.asList(userText.split(" "));

        List<MistakeDetailDto> mistakes = new ArrayList<>();
        LevenshteinDistance lv = new LevenshteinDistance();

        // So sánh word-level bằng diffutils
        Patch<String> patch = DiffUtils.diff(correctTokens, userTokens);
        for (Delta<String> delta : patch.getDeltas()) {
            TYPE type = delta.getType();

            List<String> original = delta.getOriginal().getLines();
            List<String> revised = delta.getRevised().getLines();

            switch (type) {
                case DELETE:
                    // User thiếu từ
                    for (String word : original) {
                        mistakes.add(MistakeDetailDto.builder()
                                .type(DictationMistake.MISSING)
                                .word(word)
                                .build());
                    }
                    break;

                case INSERT:
                    // User dư từ
                    for (String word : revised) {
                        mistakes.add(MistakeDetailDto.builder()
                                .type(DictationMistake.EXTRA)
                                .word(word)
                                .build());
                    }
                    break;

                case CHANGE:
                    // So sánh từng từ trong phần thay đổi
                    int min = Math.min(original.size(), revised.size());
                    for (int i = 0; i < min; i++) {
                        String correctWord = original.get(i);
                        String userWord = revised.get(i);
                        int distance = lv.apply(correctWord, userWord);
                        double sim = 1.0 - (double) distance / Math.max(correctWord.length(), userWord.length());
                        if (sim >= 0.8) {
                            mistakes.add(MistakeDetailDto.builder()
                                    .type(DictationMistake.SPELLING)
                                    .from(userWord)
                                    .to(correctWord)
                                    .build());
                        } else {
                            mistakes.add(MistakeDetailDto.builder()
                                    .type(DictationMistake.WRONG_WORD)
                                    .from(userWord)
                                    .to(correctWord)
                                    .build());
                        }
                    }

                    // Nếu thiếu/dư từ trong phần CHANGE
                    if (original.size() > revised.size()) {
                        for (int i = revised.size(); i < original.size(); i++) {
                            mistakes.add(MistakeDetailDto.builder()
                                    .type(DictationMistake.MISSING)
                                    .word(original.get(i))
                                    .build());
                        }
                    } else if (revised.size() > original.size()) {
                        for (int i = original.size(); i < revised.size(); i++) {
                            mistakes.add(MistakeDetailDto.builder()
                                    .type(DictationMistake.EXTRA)
                                    .word(revised.get(i))
                                    .build());
                        }
                    }
                    break;
            }
        }

        //Tính điểm
        double accuracy = Math.max(0, ((double) (correctTokens.size() - mistakes.size()) / correctTokens.size())) * 100;
        boolean isCorrect = accuracy >= 95 && mistakes.isEmpty();

        //Convert MistakeDetailDto → Map<String,Object>
        List<Map<String, Object>> mistakeMaps = mistakes.stream().map(m -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("type", m.getType().name());
            map.put("from", m.getFrom());
            map.put("to", m.getTo());
            map.put("word", m.getWord());
            return map;
        }).toList();

        //Lưu DB
        Answer answer = Answer.builder()
                .attemptSection(attemptSection)
                .question(question)
                .answerContent(request.getAnswerContent())
                .isCorrect(isCorrect)
                .mistakes(mistakeMaps)
                .accuracy(accuracy)
                .build();

        answerRepository.save(answer);
        AnswerResponse response = modelMapper.map(answer, AnswerResponse.class);
        response.setCorrectAnswer(question.getScript());
        response.setAttemptSectionId(attemptSectionId);
        response.setQuestionId(questionId);
        return response;
    }

    // Chuẩn hóa text (bỏ dấu câu, lowercase, trim)
    private String normalizeText(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", " ")
                .trim();
    }
}

