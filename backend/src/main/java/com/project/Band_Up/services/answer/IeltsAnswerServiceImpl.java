package com.project.Band_Up.services.answer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Band_Up.dtos.answer.AnswerCreateRequest;
import com.project.Band_Up.dtos.answer.AnswerDetail;
import com.project.Band_Up.dtos.answer.DictationAnswerResponse;
import com.project.Band_Up.dtos.answer.IeltsAnswerResponse;
import com.project.Band_Up.dtos.attempt.TestResultResponseDTO;
import com.project.Band_Up.dtos.question.QuestionContent;
import com.project.Band_Up.dtos.question.QuestionResponse;
import com.project.Band_Up.dtos.section.SectionResponse;
import com.project.Band_Up.entities.*;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.repositories.*;
import com.project.Band_Up.services.attempt.AttemptService;
import com.project.Band_Up.services.question.QuestionService;
import com.project.Band_Up.services.section.SectionService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class IeltsAnswerServiceImpl extends AbstractAnswerServiceImpl {

    protected final TestRepository testRepository;
    protected final SectionService sectionService;
    protected final QuestionService questionService;
    protected final AttemptRepository attemptRepository;
    private final AccountRepository accountRepository;
    private final AttemptService attemptService;

    public IeltsAnswerServiceImpl(
            AnswerRepository answerRepository,
            AttemptSectionRepository attemptSectionRepository,
            QuestionRepository questionRepository,
            ModelMapper modelMapper,
            ObjectMapper objectMapper,
            TestRepository testRepository,
            SectionService sectionService,
            QuestionService questionService,
            AttemptRepository attemptRepository,
            AccountRepository accountRepository,
            AttemptService attemptService
    ) {
        super(answerRepository, attemptSectionRepository, questionRepository, modelMapper, objectMapper);
        this.testRepository = testRepository;
        this.sectionService = sectionService;
        this.questionService = questionService;
        this.attemptRepository = attemptRepository;
        this.accountRepository = accountRepository;
        this.attemptService = attemptService;
    }

    public TestResultResponseDTO submitIeltsAnswerForTest(UUID attemptId, AnswerCreateRequest request, UUID userId) {
        // Lấy Attempt từ database bằng attemptId
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        // Kiểm tra nếu attempt này thuộc về user hiện tại và trạng thái là PENDING
        if (!attempt.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not the owner of this attempt");
        }
        if (attempt.getStatus() == Status.ENDED) {
            throw new RuntimeException("Attempt has already been submitted.");
        }

        // ✅ DEBUG: Log request
        System.out.println("========== DEBUG START ==========");
        System.out.println("Total answers in request: " + request.getAnswers().size());
        request.getAnswers().forEach(a ->
                System.out.println("Request Answer - QuestionNumber: " + a.getQuestionNumber() +
                        " (Type: " + a.getQuestionNumber().getClass().getName() +
                        "), Content: " + a.getAnswerContent())
        );

        // ✅ Lấy tất cả attemptSection của attempt này
        List<AttemptSection> attemptSections = attemptSectionRepository.findByAttemptId(attemptId);
        System.out.println("Total attemptSections: " + attemptSections.size());

        // ✅ Lấy tất cả section của test
        List<SectionResponse> allSections = sectionService.getSectionsByTestId(attempt.getTest().getId());
        System.out.println("Total sections in test: " + allSections.size());

        // ✅ Kiểm tra xem user có chọn làm hết tất cả section hay không
        boolean isFullTest = (attemptSections.size() == allSections.size());
        System.out.println("Is full test: " + isFullTest);

        List<IeltsAnswerResponse> allResponses = new ArrayList<>();
        int correctAnswers = 0;

        // Lặp qua các attemptSection
        for (AttemptSection attemptSection : attemptSections) {
            UUID sectionId = attemptSection.getSection().getId();
            System.out.println("\n--- Processing Section: " + sectionId + " ---");

            List<QuestionResponse> questions = questionService.getAllQuestionsBySectionId(sectionId);
            System.out.println("Total questions in section: " + questions.size());

            // Lặp qua tất cả các câu hỏi của mỗi section
            for (QuestionResponse question : questions) {

                Object questionNumberObj = question.getContent().get("questionNumber");
                System.out.println("\nQuestion ID: " + question.getId());
                System.out.println("Question Number from DB: " + questionNumberObj +
                        " (Type: " + (questionNumberObj != null ? questionNumberObj.getClass().getName() : "null") + ")");
                System.out.println("Question Content: " + question.getContent());

                String questionNumberStr = questionNumberObj != null ? String.valueOf(questionNumberObj) : null;

                // Tìm câu trả lời
                AnswerDetail answerDetail = request.getAnswers().stream()
                        .filter(a -> {
                            if (a.getQuestionNumber() == null || questionNumberStr == null) {
                                return false;
                            }
                            String userQuestionNumber = String.valueOf(a.getQuestionNumber());
                            boolean matches = userQuestionNumber.equals(questionNumberStr);
                            System.out.println("  Comparing: '" + userQuestionNumber + "' vs '" + questionNumberStr + "' = " + matches);
                            return matches;
                        })
                        .findFirst()
                        .orElse(null);

                System.out.println("Answer found: " + (answerDetail != null));

                if (answerDetail != null) {
                    System.out.println("Processing answer for question " + questionNumberStr);

                    Map<String, Object> questionContentMap = question.getContent();
                    String correctAnswer = (String) questionContentMap.get("correctAnswer");
                    String normalizedAnswerContent = normalizeText(answerDetail.getAnswerContent());
                    String normalizedCorrectAnswer = normalizeText(correctAnswer);

                    System.out.println("User answer (normalized): '" + normalizedAnswerContent + "'");
                    System.out.println("Correct answer (normalized): '" + normalizedCorrectAnswer + "'");

                    // So sánh sau khi đã normalize cả 2
                    boolean isCorrect = normalizedAnswerContent.equals(normalizedCorrectAnswer);
                    System.out.println("Is correct: " + isCorrect);

                    if (isCorrect) {
                        correctAnswers++;
                    }

                    Answer answer = Answer.builder()
                            .attemptSection(attemptSection)
                            .question(questionRepository.findById(question.getId())
                                    .orElseThrow(() -> new RuntimeException("Question not found")))
                            .answerContent(normalizedAnswerContent)
                            .isCorrect(isCorrect)
                            .createAt(LocalDateTime.now())
                            .build();

                    // Lưu Answer vào DB
                    Answer savedAnswer = answerRepository.save(answer);
                    System.out.println("Saved answer with ID: " + savedAnswer.getId());

                    IeltsAnswerResponse response = IeltsAnswerResponse.builder()
                            .id(savedAnswer.getId())
                            .attemptSectionId(attemptSection.getId())
                            .questionId(question.getId())
                            .answerContent(normalizedAnswerContent)
                            .correctAnswer(normalizedCorrectAnswer)
                            .isCorrect(isCorrect)
                            .createAt(LocalDateTime.now())
                            .build();

                    allResponses.add(response);
                } else {
                    System.out.println("⚠️ NO ANSWER FOUND for question " + questionNumberStr);
                }
            }
        }

        System.out.println("\n========== SUMMARY ==========");
        System.out.println("Total correct answers: " + correctAnswers);
        System.out.println("Total responses: " + allResponses.size());
        System.out.println("========== DEBUG END ==========\n");

        // Tính tổng điểm
        int totalScore = correctAnswers;

        Double bandScore = null;
        if (isFullTest) {
            bandScore = calculateBandScore(totalScore, attempt.getTest().getId());
        }

        // Cập nhật attempt với điểm số và band điểm và set status của tất cả về ENDED
        updateAttempt(attemptId, totalScore, bandScore);
        attemptService.updateAttemptStatus(attemptId);

        // Trả về kết quả test
        return TestResultResponseDTO.builder()
                .testId(attempt.getTest().getId())
                .totalScore(totalScore)
                .bandScore(bandScore != null ? bandScore : 0.0)
                .responses(allResponses)
                .build();
    }

    // XÓA method updateAttempt trùng lặp - chỉ giữ lại 1 method này
    private void updateAttempt(UUID attemptId, int score, Double bandScore) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        attempt.setScore(score);
        if (bandScore != null) {
            attempt.setOverallBand(bandScore);
        }
        attempt.setSubmitAt(LocalDateTime.now());
        attempt.setStatus(Status.ENDED);

        attemptRepository.save(attempt);
    }



    // Method to calculate IELTS band score based on correct answers
    private double calculateBandScore(int score, UUID testId) {
        if (score >= 39) return 9.0;
        else if (score >= 37) return 8.5;
        else if (score >= 35) return 8.0;
        else if (score >= 32) return 7.5;
        else if (score >= 30) return 7.0;
        else if (score >= 26) return 6.5;
        else if (score >= 23) return 6.0;
        else if (score >= 18) return 5.5;
        else if (score >= 16) return 5.0;
        else if (score >= 13) return 4.5;
        else if (score >= 10) return 4.0;
        else if (score >= 7)  return 3.5;
        else if (score >= 5)  return 3.0;
        else if (score >= 3)  return 2.5;
        else if (score >= 1)  return 2.0;
        else return 1.0; // score == 0
    }




    private String normalizeText(String text) {
        if (text == null) return "";
        String normalizedText = text.toLowerCase();
        normalizedText = normalizedText.replaceAll("[^a-z0-9\\s]", "");
        normalizedText = normalizedText.trim().replaceAll("\\s+", " ");
        return normalizedText;
    }
}


