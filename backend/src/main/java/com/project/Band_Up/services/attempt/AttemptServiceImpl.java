package com.project.Band_Up.services.attempt;

import com.project.Band_Up.dtos.answer.AnswerDetailResponse;
import com.project.Band_Up.dtos.attempt.AttemptCreateRequest;
import com.project.Band_Up.dtos.attempt.AttemptDetailResponse;
import com.project.Band_Up.dtos.attempt.AttemptResponse;
import com.project.Band_Up.dtos.attempt.AttemptUpdateRequest;
import com.project.Band_Up.dtos.attemptSection.AttemptSectionDetailResponse;
import com.project.Band_Up.dtos.attemptSection.AttemptSectionResponse;
import com.project.Band_Up.dtos.question.QuestionResponse;
import com.project.Band_Up.dtos.section.SectionDetailResponse;
import com.project.Band_Up.entities.*;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.repositories.*;
import com.project.Band_Up.services.awsService.S3Service;
import com.project.Band_Up.services.media.MediaService;
import com.project.Band_Up.services.question.QuestionService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttemptServiceImpl implements AttemptService {
    private final AttemptRepository attemptRepository;
    private final AttemptSectionRepository attemptSectionRepository;
    private final AccountRepository accountRepository;
    private final TestRepository testRepository;
    private final ModelMapper modelMapper;
    private final QuestionService questionService;
    private final AnswerRepository answerRepository;
    private final MediaRepository mediaRepository;
    private final S3Service s3Service;

    @Override
    public List<AttemptResponse> getAllAttemptsByUserId(UUID userId) {
        accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Attempt> attempts = attemptRepository.findAllByUser_IdOrderByStartAtDesc(userId);
        return attempts.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttemptResponse> getAllAttemptsByUserIdAndTestId(UUID userId, UUID testId) {
        accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        List<Attempt> attempts = attemptRepository.findAllByUser_IdAndTest_IdOrderByStartAtDesc(userId, testId);
        return attempts.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AttemptResponse getAttemptById(UUID attemptId) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        return toResponse(attempt);
    }

    @Override
    public List<AttemptResponse> getAttemptsByUserIdAndStatus(UUID userId, Status status) {
        accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Attempt> attempts = attemptRepository.findAllByUser_IdAndStatusOrderByStartAtDesc(userId, status);
        return attempts.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AttemptResponse createAttempt(UUID userId, UUID testId, AttemptCreateRequest createRequest) {
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        Attempt attempt = modelMapper.map(createRequest, Attempt.class);
        attempt.setUser(user);
        attempt.setTest(test);
        attempt.setStatus(Status.ONGOING);

        Attempt saved = attemptRepository.save(attempt);
        return toResponse(saved);
    }

    @Override
    public AttemptResponse updateAttempt(UUID attemptId, UUID userId, AttemptUpdateRequest updateRequest) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not the owner of this attempt");
        }

        modelMapper.map(updateRequest, attempt);
        Attempt updated = attemptRepository.save(attempt);

        return toResponse(updated);
    }

    @Override
    public void deleteAttempt(UUID attemptId, UUID userId) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not the owner of this attempt");
        }
        List<AttemptSection> attemptSection = attemptSectionRepository.findByAttemptId(attemptId);
        attemptSectionRepository.deleteAll(attemptSection);
        attemptRepository.delete(attempt);
    }
    @Override
    public void updateAttemptStatus(UUID attemptId){
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        List<AttemptSection> sections =
                attemptSectionRepository.findAllByAttempt_IdOrderByStartAtDesc(attempt.getId());
        attempt.setStatus(Status.ENDED);
        sections.forEach(section -> {
            section.setStatus(Status.ENDED);
        });
    }

    private AttemptResponse toResponse(Attempt attempt) {
        AttemptResponse response = modelMapper.map(attempt, AttemptResponse.class);
        if (attempt.getUser() != null) {
            response.setUserId(attempt.getUser().getId());
        }
        if (attempt.getTest() != null) {
            response.setTestId(attempt.getTest().getId());
        }
        List<AttemptSection> sections =
                attemptSectionRepository.findAllByAttempt_IdOrderByStartAtDesc(attempt.getId());
        List<AttemptSectionResponse> sectionResponses = sections.stream()
                .map(s -> AttemptSectionResponse.builder()
                        .id(s.getId())
                        .attemptId(s.getAttempt().getId())
                        .sectionId(s.getSection().getId())
                        .startAt(s.getStartAt())
                        .status(s.getStatus())
                        .build()
                )
                .toList();
        response.setAttemptSections(sectionResponses);
        return response;
    }
    @Override
    public AttemptDetailResponse getAttemptDetail(UUID attemptId, UUID userId) {
        System.out.println("========== GET ATTEMPT DETAIL START ==========");
        System.out.println("Attempt ID: " + attemptId);
        System.out.println("User ID: " + userId);

        // 1. Lấy Attempt và kiểm tra quyền sở hữu
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not the owner of this attempt");
        }

        // 2. Kiểm tra attempt đã ENDED chưa
        if (attempt.getStatus() != Status.ENDED) {
            throw new RuntimeException("Attempt has not been submitted yet. Status: " + attempt.getStatus());
        }

        System.out.println("Attempt status: " + attempt.getStatus());

        // 3. Lấy thông tin Test
        Test test = attempt.getTest();
        System.out.println("Test ID: " + test.getId());
        System.out.println("Test Title: " + test.getTitle());

        // 4. Lấy tất cả AttemptSection của attempt này
        List<AttemptSection> attemptSections = attemptSectionRepository.findByAttemptId(attemptId);
        System.out.println("Total attemptSections: " + attemptSections.size());

        // 5. Xử lý từng AttemptSection
        List<AttemptSectionDetailResponse> attemptSectionDetails = new ArrayList<>();

        for (AttemptSection attemptSection : attemptSections) {
            System.out.println("\n--- Processing AttemptSection: " + attemptSection.getId() + " ---");

            // Lấy Section info
            Section section = attemptSection.getSection();
            System.out.println("Section ID: " + section.getId());
            System.out.println("Section Title: " + section.getTitle());

            // Lấy tất cả Questions của section này
            List<QuestionResponse> questions = questionService.getAllQuestionsBySectionId(section.getId());
            System.out.println("Total questions: " + questions.size());

            // Lấy tất cả Answers của attemptSection này
            List<Answer> answers = answerRepository.findByAttemptSectionId(attemptSection.getId());
            System.out.println("Total answers: " + answers.size());

            // Tạo list AnswerDetailResponse
            List<AnswerDetailResponse> answerDetails = new ArrayList<>();

            for (QuestionResponse question : questions) {
                // Tìm answer tương ứng với question
                Answer answer = answers.stream()
                        .filter(a -> a.getQuestion().getId().equals(question.getId()))
                        .findFirst()
                        .orElse(null);

                // Lấy questionNumber từ content của question
                Map<String, Object> questionContent = question.getContent();
                Integer questionNumber = null;
                if (questionContent.get("questionNumber") != null) {
                    Object qnObj = questionContent.get("questionNumber");
                    if (qnObj instanceof Integer) {
                        questionNumber = (Integer) qnObj;
                    } else {
                        questionNumber = Integer.parseInt(String.valueOf(qnObj));
                    }
                }

                // Lấy correctAnswer
                String correctAnswer = (String) questionContent.get("correctAnswer");

                if (answer != null) {
                    System.out.println("Question #" + questionNumber + " - Answer found");

                    AnswerDetailResponse answerDetail = AnswerDetailResponse.builder()
                            .AnswerId(answer.getId())
                            .questionNumber(questionNumber)
                            .answerContent(answer.getAnswerContent())
                            .correctAnswer(correctAnswer)
                            .isCorrect(answer.isCorrect())
                            .build();

                    answerDetails.add(answerDetail);
                } else {
                    // Không tìm thấy answer (shouldn't happen nếu submitIeltsAnswerForTest đã chạy đúng)
                    System.out.println("⚠️ Question #" + questionNumber + " - No answer found");

                    AnswerDetailResponse answerDetail = AnswerDetailResponse.builder()
                            .AnswerId(null)
                            .questionNumber(questionNumber)
                            .answerContent(null)
                            .correctAnswer(correctAnswer)
                            .isCorrect(false)
                            .build();

                    answerDetails.add(answerDetail);
                }
            }

            // Sắp xếp answers theo questionNumber
            answerDetails.sort((a, b) -> {
                if (a.getQuestionNumber() == null) return 1;
                if (b.getQuestionNumber() == null) return -1;
                return a.getQuestionNumber().compareTo(b.getQuestionNumber());
            });

            // Tạo SectionDetailResponse
            SectionDetailResponse sectionDetail = SectionDetailResponse.builder()
                    .SectionId(section.getId())
                    .title(section.getTitle())
                    .orderIndex(section.getOrderIndex())
                    .timeLimitSeconds(section.getTimeLimitSeconds())
                    .metadata(section.getMetadata())
                    .cloudfrontUrl(getSectionCloudfrontUrl(section.getId())) // Helper method
                    .answers(answerDetails)
                    .build();

            // Tạo AttemptSectionDetailResponse
            AttemptSectionDetailResponse attemptSectionDetail = AttemptSectionDetailResponse.builder()
                    .attemptSectionId(attemptSection.getId())
                    .sections(List.of(sectionDetail)) // Mỗi attemptSection có 1 section
                    .build();

            attemptSectionDetails.add(attemptSectionDetail);
        }

        // 6. Tạo AttemptDetailResponse
        AttemptDetailResponse response = AttemptDetailResponse.builder()
                .attemptId(attempt.getId())
                .testId(test.getId())
                .testTitle(test.getTitle())
                .testSkillName(test.getSkillName())
                .attemptSections(attemptSectionDetails)
                .build();

        System.out.println("\n========== SUMMARY ==========");
        System.out.println("Total sections: " + attemptSectionDetails.size());
        System.out.println("========== GET ATTEMPT DETAIL END ==========\n");

        return response;
    }

    private String getSectionCloudfrontUrl(UUID sectionId) {
        try {
            // Tìm media đầu tiên của section này
            return mediaRepository.findFirstBySection_Id(sectionId)
                    .map(media -> {
                        // Tạo CloudFront signed URL từ s3Key
                        return s3Service.createCloudFrontSignedUrl(media.getS3Key());
                    })
                    .orElse(null); // Không có media thì trả về null
        } catch (Exception e) {
            System.out.println("⚠️ Error getting CloudFront URL for section " + sectionId + ": " + e.getMessage());
            return null;
        }
    }
}
