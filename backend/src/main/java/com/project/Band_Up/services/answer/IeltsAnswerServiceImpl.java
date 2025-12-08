package com.project.Band_Up.services.answer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Band_Up.dtos.answer.*;
import com.project.Band_Up.dtos.attempt.TestResultResponseDTO;
import com.project.Band_Up.dtos.media.UploadInfo;
import com.project.Band_Up.dtos.question.QuestionContent;
import com.project.Band_Up.dtos.question.QuestionResponse;
import com.project.Band_Up.dtos.section.SectionResponse;
import com.project.Band_Up.entities.*;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.repositories.*;
import com.project.Band_Up.services.attempt.AttemptService;
import com.project.Band_Up.services.awsService.S3Service;
import com.project.Band_Up.services.question.QuestionService;
import com.project.Band_Up.services.section.SectionService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
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
    private final S3Service s3Service;

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
            AttemptService attemptService,
            S3Service s3Service
    ) {
        super(answerRepository, attemptSectionRepository, questionRepository, modelMapper, objectMapper);
        this.testRepository = testRepository;
        this.sectionService = sectionService;
        this.questionService = questionService;
        this.attemptRepository = attemptRepository;
        this.accountRepository = accountRepository;
        this.attemptService = attemptService;
        this.s3Service = s3Service;
    }
    @Value("${aws.s3.bucket.speaking.audio}")
    private String speakingAudioBucket;

    private static final String DEFAULT_AUDIO_CONTENT_TYPE = "audio/mpeg";


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

            // ✅ THAY ĐỔI CHÍNH: Lặp qua TẤT CẢ câu hỏi, không chỉ câu có answer
            for (QuestionResponse question : questions) {

                Object questionNumberObj = question.getContent().get("questionNumber");
                System.out.println("\nQuestion ID: " + question.getId());
                System.out.println("Question Number from DB: " + questionNumberObj +
                        " (Type: " + (questionNumberObj != null ? questionNumberObj.getClass().getName() : "null") + ")");

                String questionNumberStr = questionNumberObj != null ? String.valueOf(questionNumberObj) : null;

                // Tìm câu trả lời của user (nếu có)
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

                // ✅ Lấy correctAnswer từ question
                Map<String, Object> questionContentMap = question.getContent();
                String correctAnswer = (String) questionContentMap.get("correctAnswer");
                String normalizedCorrectAnswer = normalizeText(correctAnswer);

                // ✅ Xử lý answer content và tính điểm
                String normalizedAnswerContent = null;
                Boolean isCorrect = null;
                Answer savedAnswer = null;

                if (answerDetail != null) {
                    // User đã trả lời câu này
                    normalizedAnswerContent = normalizeText(answerDetail.getAnswerContent());

                    System.out.println("User answer (normalized): '" + normalizedAnswerContent + "'");
                    System.out.println("Correct answer (normalized): '" + normalizedCorrectAnswer + "'");

                    // So sánh sau khi đã normalize cả 2
                    isCorrect = normalizedAnswerContent.equals(normalizedCorrectAnswer);
                    System.out.println("Is correct: " + isCorrect);

                    if (isCorrect) {
                        correctAnswers++;
                    }

                    // Lưu answer vào DB
                    Answer answer = Answer.builder()
                            .attemptSection(attemptSection)
                            .question(questionRepository.findById(question.getId())
                                    .orElseThrow(() -> new RuntimeException("Question not found")))
                            .answerContent(normalizedAnswerContent)
                            .isCorrect(isCorrect)
                            .createAt(LocalDateTime.now())
                            .build();

                    savedAnswer = answerRepository.save(answer);
                    System.out.println("Saved answer with ID: " + savedAnswer.getId());
                } else {
                    // User KHÔNG trả lời câu này
                    System.out.println("⚠️ NO ANSWER PROVIDED for question " + questionNumberStr);

                    // Vẫn lưu vào DB nhưng với answerContent = null, isCorrect = false
                    Answer answer = Answer.builder()
                            .attemptSection(attemptSection)
                            .question(questionRepository.findById(question.getId())
                                    .orElseThrow(() -> new RuntimeException("Question not found")))
                            .answerContent(null)
                            .isCorrect(false)
                            .createAt(LocalDateTime.now())
                            .build();

                    savedAnswer = answerRepository.save(answer);
                    System.out.println("Saved empty answer with ID: " + savedAnswer.getId());

                    isCorrect = false;
                }

                // ✅ LUÔN tạo response cho MỌI câu hỏi (có answer hay không)
                IeltsAnswerResponse response = IeltsAnswerResponse.builder()
                        .id(savedAnswer.getId())
                        .attemptSectionId(attemptSection.getId())
                        .questionId(question.getId())
                        .answerContent(normalizedAnswerContent) // null nếu user không trả lời
                        .correctAnswer(normalizedCorrectAnswer) // luôn hiển thị đáp án đúng
                        .isCorrect(isCorrect)
                        .createAt(LocalDateTime.now())
                        .build();

                allResponses.add(response);
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
    public TestResultResponseDTO getAttemptAnswers(UUID attemptId, UUID userId) {
        System.out.println("========== GET ATTEMPT ANSWERS START ==========");
        System.out.println("Attempt ID: " + attemptId);
        System.out.println("User ID: " + userId);

        // Lấy Attempt từ database
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        // Kiểm tra quyền sở hữu
        if (!attempt.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not the owner of this attempt");
        }

        // Kiểm tra attempt đã submit chưa
        if (attempt.getStatus() != Status.ENDED) {
            throw new RuntimeException("Attempt has not been submitted yet");
        }

        System.out.println("Attempt status: " + attempt.getStatus());
        System.out.println("Total score: " + attempt.getScore());
        System.out.println("Band score: " + attempt.getOverallBand());

        // Lấy tất cả attemptSection của attempt này
        List<AttemptSection> attemptSections = attemptSectionRepository.findByAttemptId(attemptId);
        System.out.println("Total attemptSections: " + attemptSections.size());

        List<IeltsAnswerResponse> allResponses = new ArrayList<>();

        // Lặp qua từng section mà user đã chọn làm
        for (AttemptSection attemptSection : attemptSections) {
            UUID sectionId = attemptSection.getSection().getId();
            System.out.println("\n--- Processing Section: " + sectionId + " ---");

            // Lấy tất cả câu hỏi của section
            List<QuestionResponse> questions = questionService.getAllQuestionsBySectionId(sectionId);
            System.out.println("Total questions in section: " + questions.size());

            // Lấy tất cả answers của attemptSection này từ DB
            List<Answer> savedAnswers = answerRepository.findByAttemptSectionId(attemptSection.getId());
            System.out.println("Total saved answers: " + savedAnswers.size());

            // Lặp qua tất cả câu hỏi
            for (QuestionResponse question : questions) {
                System.out.println("\nProcessing Question ID: " + question.getId());

                // Tìm answer tương ứng với question này
                Answer answer = savedAnswers.stream()
                        .filter(a -> a.getQuestion().getId().equals(question.getId()))
                        .findFirst()
                        .orElse(null);

                // Lấy correctAnswer từ question
                Map<String, Object> questionContentMap = question.getContent();
                String correctAnswer = (String) questionContentMap.get("correctAnswer");
                String normalizedCorrectAnswer = normalizeText(correctAnswer);

                if (answer != null) {
                    System.out.println("Found answer - ID: " + answer.getId());
                    System.out.println("Answer content: " + answer.getAnswerContent());
                    System.out.println("Is correct: " + answer.isCorrect());

                    // Tạo response từ answer đã lưu
                    IeltsAnswerResponse response = IeltsAnswerResponse.builder()
                            .id(answer.getId())
                            .attemptSectionId(attemptSection.getId())
                            .questionId(question.getId())
                            .answerContent(answer.getAnswerContent()) // có thể null nếu user không trả lời
                            .correctAnswer(normalizedCorrectAnswer)
                            .isCorrect(answer.isCorrect())
                            .createAt(answer.getCreateAt())
                            .build();

                    allResponses.add(response);
                } else {
                    // Trường hợp không tìm thấy answer (có thể do data inconsistency)
                    System.out.println("⚠️ WARNING: No answer found for question " + question.getId());

                    // Vẫn tạo response nhưng với thông tin rỗng
                    IeltsAnswerResponse response = IeltsAnswerResponse.builder()
                            .id(null)
                            .attemptSectionId(attemptSection.getId())
                            .questionId(question.getId())
                            .answerContent(null)
                            .correctAnswer(normalizedCorrectAnswer)
                            .isCorrect(false)
                            .createAt(LocalDateTime.now())
                            .build();

                    allResponses.add(response);
                }
            }
        }

        System.out.println("\n========== SUMMARY ==========");
        System.out.println("Total responses: " + allResponses.size());
        System.out.println("========== GET ATTEMPT ANSWERS END ==========\n");

        // Trả về kết quả giống như khi chấm điểm
        return TestResultResponseDTO.builder()
                .testId(attempt.getTest().getId())
                .totalScore(attempt.getScore())
                .bandScore(attempt.getOverallBand() != null ? attempt.getOverallBand() : 1.0)
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


    public IeltsAnswerResponse saveWritingAnswer(UUID attemptSectionId, UUID questionId, String answerContent, UUID userId) {
        System.out.println("========== SAVE WRITING ANSWER START ==========");
        System.out.println("AttemptSection ID: " + attemptSectionId);
        System.out.println("Question ID: " + questionId);
        System.out.println("User ID: " + userId);
        System.out.println("Answer content length: " + (answerContent != null ? answerContent.length() : 0));

        // 1. Validate AttemptSection exists
        AttemptSection attemptSection = attemptSectionRepository.findById(attemptSectionId)
                .orElseThrow(() -> new RuntimeException("AttemptSection not found with ID: " + attemptSectionId));

        // 2. Check if user owns this attempt
        if (!attemptSection.getAttempt().getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not the owner of this attempt");
        }

        // 3. Check if attempt is still in progress (not submitted)
        if (attemptSection.getAttempt().getStatus() == Status.ENDED) {
            throw new RuntimeException("Cannot save answer. Attempt has already been submitted.");
        }

        // 4. Validate Question exists
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found with ID: " + questionId));

        System.out.println("Question type: " + question.getContent().get("questionType"));

        // 5. Check if answer already exists for this attemptSection and question
        Answer existingAnswer = answerRepository.findByAttemptSection_IdAndQuestion_Id(attemptSectionId, questionId);

        Answer savedAnswer;

        if (existingAnswer != null) {
            // Update existing answer
            System.out.println("Updating existing answer with ID: " + existingAnswer.getId());
            existingAnswer.setAnswerContent(answerContent);
            existingAnswer.setCreateAt(LocalDateTime.now());
            savedAnswer = answerRepository.save(existingAnswer);
            System.out.println("Updated existing answer");
        } else {
            // Create new answer
            System.out.println("Creating new answer");
            Answer newAnswer = Answer.builder()
                    .attemptSection(attemptSection)
                    .question(question)
                    .answerContent(answerContent)
                    .isCorrect(true) // Will be set after AI evaluation
                    .createAt(LocalDateTime.now())
                    .build();

            savedAnswer = answerRepository.save(newAnswer);
            System.out.println("Created new answer with ID: " + savedAnswer.getId());
        }

        // 6. Build response (without correctAnswer and isCorrect since not evaluated yet)
        IeltsAnswerResponse response = IeltsAnswerResponse.builder()
                .id(savedAnswer.getId())
                .attemptSectionId(attemptSectionId)
                .questionId(questionId)
                .answerContent(savedAnswer.getAnswerContent())
                .correctAnswer(null) // Not evaluated yet
                .isCorrect(false) // Default to false, will be updated after AI evaluation
                .createAt(savedAnswer.getCreateAt())
                .build();

        System.out.println("========== SAVE WRITING ANSWER END ==========\n");

        return response;
    }




    public S3SpeakingUploadUrl generateSpeakingUploadUrl(
            SaveSpeakingAnswerRequest request,
            UUID attemptSectionId,
            UUID userId) {

        System.out.println("========== GENERATE SPEAKING UPLOAD URL START ==========");
        System.out.println("AttemptSection ID: " + attemptSectionId);
        System.out.println("User ID: " + userId);
        System.out.println("Audio name: " + request.getAudioName());

        try {
            // 1. Validate AttemptSection exists
            AttemptSection attemptSection = attemptSectionRepository.findById(attemptSectionId)
                    .orElseThrow(() -> new RuntimeException("AttemptSection not found with ID: " + attemptSectionId));

            // 2. Check if user owns this attempt
            if (!attemptSection.getAttempt().getUser().getId().equals(userId)) {
                throw new RuntimeException("You are not the owner of this attempt");
            }

            // 3. Check if attempt is still in progress (not submitted)
            if (attemptSection.getAttempt().getStatus() == Status.ENDED) {
                throw new RuntimeException("Cannot generate upload URL. Attempt has already been submitted.");
            }

//            // 4. Validate Question exists
//            Question question = questionRepository.findById(questionId)
//                    .orElseThrow(() -> new RuntimeException("Question not found with ID: " + questionId));
//
//            System.out.println("Question type: " + question.getContent().get("questionType"));


            // 5. Tạo key cho S3: speaking-audios/{userId}/{attemptSectionId}/{uuid}-{audioName}
            String s3Key = String.format("speaking-audios/%s/%s/%s-%s",
                    userId.toString(),
                    attemptSectionId.toString(),
                    UUID.randomUUID().toString(),
                    sanitizeFileName(request.getAudioName()));

            System.out.println("Generated S3 key: " + s3Key);

            // 6. Tạo presigned URL
            UploadInfo uploadInfo = s3Service.createUploadPresignedUrl(s3Key, DEFAULT_AUDIO_CONTENT_TYPE);

            System.out.println("Presigned URL generated successfully");
            System.out.println("Expires at: " + uploadInfo.getExpiresAt());
            System.out.println("========== GENERATE SPEAKING UPLOAD URL END ==========\n");

            return S3SpeakingUploadUrl.builder()
                    .uploadUrl(uploadInfo.getPresignedUrl())
                    .build();

        } catch (Exception e) {
            System.err.println("Failed to generate presigned URL: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate upload URL for speaking audio", e);
        }
    }

    /**
     * Lưu speaking answer với S3 audio URL vào database
     */
    public AnswerSpeakingResponse saveSpeakingAnswer(
            UUID attemptSectionId,
            String audioName,
            UUID userId) {

        try {
            // 1. Validate AttemptSection exists
            AttemptSection attemptSection = attemptSectionRepository.findById(attemptSectionId)
                    .orElseThrow(() -> new RuntimeException("AttemptSection not found with ID: " + attemptSectionId));

            // 2. Check if user owns this attempt
            if (!attemptSection.getAttempt().getUser().getId().equals(userId)) {
                throw new RuntimeException("You are not the owner of this attempt");
            }

            // 3. Check if attempt is still in progress (not submitted)
            if (attemptSection.getAttempt().getStatus() == Status.ENDED) {
                throw new RuntimeException("Cannot save answer. Attempt has already been submitted.");
            }

//            // 4. Validate Question exists
//            Question question = questionRepository.findById(questionId)
//                    .orElseThrow(() -> new RuntimeException("Question not found with ID: " + questionId));


            // 5. Check if answer already exists for this attemptSection and question
            Answer existingAnswer = answerRepository.findByAttemptSection_Id(attemptSectionId);

            Answer savedAnswer;

            String cleanKey = audioName.startsWith("/") ? audioName.substring(1) : audioName;
            String s3Uri = String.format("s3://%s/%s", speakingAudioBucket, cleanKey);
            System.out.println("Formatted S3 URI to save: " + s3Uri);

            if (existingAnswer != null) {
                // Update existing answer
                System.out.println("Updating existing answer with ID: " + existingAnswer.getId());
                existingAnswer.setS3AudioUrl(s3Uri);
                existingAnswer.setCreateAt(LocalDateTime.now());
                savedAnswer = answerRepository.save(existingAnswer);
                System.out.println("Updated existing answer");
            } else {
                // Create new answer
                System.out.println("Creating new answer");
                Answer newAnswer = Answer.builder()
                        .attemptSection(attemptSection)
                        .answerContent(null) // Speaking answer không có text content
                        .s3AudioUrl(s3Uri)
                        .isCorrect(true) // Sẽ được set sau khi AI evaluation
                        .createAt(LocalDateTime.now())
                        .build();

                savedAnswer = answerRepository.save(newAnswer);
                System.out.println("Created new answer with ID: " + savedAnswer.getId());
            }

            // 6. Build response
//            String questionContent = (String) question.getContent().get("questionContent");

            AnswerSpeakingResponse response = AnswerSpeakingResponse.builder()
                    .AnswerId(savedAnswer.getId())
                    .questionContent(null)
                    .answerContent(null) // Speaking không có text content
                    .s3Key(savedAnswer.getS3AudioUrl())
                    .build();

            System.out.println("Response created with Answer ID: " + response.getAnswerId());
            System.out.println("========== SAVE SPEAKING ANSWER END ==========\n");

            return response;

        } catch (Exception e) {
            System.err.println("Failed to save speaking answer: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save speaking answer", e);
        }
    }

    /**
     * Helper method: Làm sạch tên file để tránh các ký tự đặc biệt
     */
    private String sanitizeFileName(String fileName) {
        if (fileName == null) {
            return "audio.mp3";
        }
        // Loại bỏ các ký tự đặc biệt, chỉ giữ lại chữ, số, dấu chấm và gạch ngang
        return fileName.replaceAll("[^a-zA-Z0-9.\\-]", "_");
    }
}


