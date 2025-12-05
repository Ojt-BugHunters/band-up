package com.project.Band_Up.services.crawTest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Band_Up.configs.CrawTestConfiguration;
import com.project.Band_Up.entities.*;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.repositories.*;
import com.project.Band_Up.services.awsService.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.math.BigInteger;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class CrawListeningTestService {

    private final TestRepository testRepository;
    private final SectionRepository sectionRepository;
    private final QuestionRepository questionRepository;
    private final MediaRepository mediaRepository;
    private final AccountRepository accountRepository;
    private final ObjectMapper objectMapper;
    private final CrawTestConfiguration config;
    private final S3Service s3Service;

    @Value("${craw-test.listening.folder-path}")
    private String listeningFolderPath;

    @Value("${craw-test.listening.media-path}")
    private String listeningMediaPath;

    @Value("${craw-test.listening.file-prefix:listening_test_}")
    private String filePrefix;

    @Value("${craw-test.listening.file-suffix:.json}")
    private String fileSuffix;

    /**
     * Import tất cả file JSON từ folder
     */
    @Transactional
    public List<String> importAllTests(UUID adminUserId) {
        List<String> results = new ArrayList<>();

        try {
            Path folderPath = Paths.get(listeningFolderPath);
            if (!Files.exists(folderPath)) {
                throw new RuntimeException("Folder not found: " + listeningFolderPath);
            }

            try (DirectoryStream<Path> stream = Files.newDirectoryStream(folderPath, "*.json")) {
                for (Path filePath : stream) {
                    String fileName = filePath.getFileName().toString();
                    if (fileName.startsWith(filePrefix) && fileName.endsWith(fileSuffix)) {
                        try {
                            String result = importSingleTest(filePath.toFile(), adminUserId);
                            results.add("✓ " + fileName + ": " + result);
                            log.info("Successfully imported: {}", fileName);
                        } catch (Exception e) {
                            results.add("✗ " + fileName + ": " + e.getMessage());
                            log.error("Failed to import {}: {}", fileName, e.getMessage());
                        }
                    }
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Error reading folder: " + e.getMessage());
        }

        return results;
    }

    /**
     * Import nhiều file theo danh sách số thứ tự
     */
    @Transactional
    public List<String> importBatchTests(List<String> testNumbers, UUID adminUserId) {
        List<String> results = new ArrayList<>();

        for (String testNumber : testNumbers) {
            String fileName = String.format("%s%s%s", filePrefix, testNumber, fileSuffix);
            File file = new File(listeningFolderPath + File.separator + fileName);

            try {
                if (!file.exists()) {
                    results.add("✗ " + fileName + ": File not found");
                    continue;
                }

                String result = importSingleTest(file, adminUserId);
                results.add("✓ " + fileName + ": " + result);
                log.info("Successfully imported: {}", fileName);
            } catch (Exception e) {
                results.add("✗ " + fileName + ": " + e.getMessage());
                log.error("Failed to import {}: {}", fileName, e.getMessage());
            }
        }

        return results;
    }

    /**
     * Import một file JSON cụ thể
     */
    @Transactional
    public String importSingleTest(File jsonFile, UUID adminUserId) throws IOException {
        // 1. Đọc JSON file
        JsonNode rootNode = objectMapper.readTree(jsonFile);

        // 2. Lấy thông tin admin user
        Account admin = accountRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        // 3. Tạo Test
        Test test = createTest(rootNode, admin);

        // 4. Tạo Sections và upload audio
        List<Section> sections = createSectionsWithAudio(rootNode, test);

        // 5. Tạo Questions
        int totalQuestions = createQuestions(rootNode, sections);

        return String.format("Test '%s' created with %d sections and %d questions",
                test.getTitle(), sections.size(), totalQuestions);
    }

    /**
     * Tạo Test từ JSON
     */
    private Test createTest(JsonNode rootNode, Account admin) {
        JsonNode metadataNode = rootNode.path("test_metadata");

        String testName = metadataNode.path("test_name").asText("Unknown Test");
        String testType = metadataNode.path("test_type").asText("listening");
        int testNumber = metadataNode.path("test_number").asInt(0);

        String title = testName;
        if (testNumber > 0) {
            title = String.format("IELTS Listening Practice Test %02d", testNumber);
        }

        Test test = Test.builder()
                .user(admin)
                .skillName("Listening")
                .title(title)
                .numberOfPeople(0)
                .durationSeconds(BigInteger.valueOf(2400)) // 40 phút cho listening
                .difficult(config.getDefaultDifficulty())
                .status(Status.Published)
                .build();

        return testRepository.save(test);
    }

    /**
     * Tạo Sections và upload audio files
     */
    private List<Section> createSectionsWithAudio(JsonNode rootNode, Test test) throws IOException {
        List<Section> sections = new ArrayList<>();
        JsonNode sectionsNode = rootNode.path("sections");
        JsonNode questionsNode = rootNode.path("questions");

        if (!sectionsNode.isArray() || sectionsNode.size() == 0) {
            log.warn("No sections found in JSON");
            return sections;
        }

        // Lấy test number từ test title
        int testNumber = extractTestNumber(test.getTitle());

        for (int i = 0; i < sectionsNode.size(); i++) {
            JsonNode sectionNode = sectionsNode.get(i);

            int sectionNumber = sectionNode.path("section_number").asInt();
            String title = sectionNode.path("title").asText();
            String audioFilePath = sectionNode.path("audio_file_path").asText();

            // Lấy HTML content từ questions node
            String htmlContent = extractHtmlContentForSection(questionsNode, sectionNumber);

            // Tạo metadata
            String metadata = createSectionMetadata(htmlContent, audioFilePath);

            // Tạo Section
            Section section = Section.builder()
                    .test(test)
                    .title(title)
                    .orderIndex(sectionNumber)
                    .timeLimitSeconds(BigInteger.valueOf(600)) // 10 phút mỗi section
                    .metadata(metadata)
                    .status(Status.Published)
                    .build();

            section = sectionRepository.save(section);
            log.info("Created section {}: {}", sectionNumber, title);

            // Upload audio và lưu Media record
            uploadAudioForSection(section, audioFilePath, testNumber);

            sections.add(section);
        }

        return sections;
    }

    /**
     * Trích xuất HTML content cho section từ questions node
     */
    private String extractHtmlContentForSection(JsonNode questionsNode, int sectionNumber) {
        if (!questionsNode.isArray()) {
            return "";
        }

        for (JsonNode questionNode : questionsNode) {
            int nodeSectionNumber = questionNode.path("section_number").asInt();
            if (nodeSectionNumber == sectionNumber) {
                return questionNode.path("html_content").asText("");
            }
        }

        return "";
    }

    /**
     * Upload audio file lên S3 và lưu Media record
     */
    private void uploadAudioForSection(Section section, String audioFilePath, int testNumber) {
        try {
            // Tạo đường dẫn đầy đủ đến file audio
            String testFolder = String.format("test_%02d", testNumber);
            Path audioPath = Paths.get(listeningMediaPath, testFolder,
                    String.format("listening_test_%02d_section_%d.mp3", testNumber, section.getOrderIndex()));

            if (!Files.exists(audioPath)) {
                log.warn("Audio file not found: {}", audioPath);
                return;
            }

            log.info("Found audio file: {} (size: {} bytes)", audioPath, Files.size(audioPath));

            // Đọc file audio
            byte[] audioData = Files.readAllBytes(audioPath);

            // Tạo S3 key
            String s3Key = String.format("listening/test_%02d/section_%d.mp3",
                    testNumber, section.getOrderIndex());

            // Upload lên S3
            s3Service.uploadFile(s3Key, audioData, "audio/mpeg");
            log.info("✓ Uploaded audio to S3: {} ({} bytes)", s3Key, audioData.length);

            // Lưu Media record
            Media media = Media.builder()
                    .section(section)
                    .s3Key(s3Key)
                    .build();

            mediaRepository.save(media);
            log.info("✓ Saved media record for section {} with S3 key: {}",
                    section.getOrderIndex(), s3Key);

        } catch (IOException e) {
            log.error("✗ Failed to upload audio for section {}: {}",
                    section.getOrderIndex(), e.getMessage(), e);
            throw new RuntimeException("Audio upload failed for section " + section.getOrderIndex(), e);
        }
    }

    /**
     * Tạo metadata cho section
     */
    private String createSectionMetadata(String htmlContent, String audioFilePath) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("htmlContent", htmlContent);
            metadata.put("audioFilePath", audioFilePath);
            metadata.put("hasAudio", true);

            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            log.error("Error creating metadata: {}", e.getMessage());
            return "{}";
        }
    }

    /**
     * Tạo Questions từ JSON
     */
    private int createQuestions(JsonNode rootNode, List<Section> sections) {
        int totalQuestions = 0;

        JsonNode questionTypesNode = rootNode.path("questionTypes");
        JsonNode answersNode = rootNode.path("answers");

        if (!questionTypesNode.isArray()) {
            return 0;
        }

        // Map question với section
        Map<Integer, Section> questionToSectionMap = mapQuestionsToSections(sections);

        for (int i = 0; i < questionTypesNode.size(); i++) {
            JsonNode questionTypeNode = questionTypesNode.get(i);

            // Lấy question number và type
            String questionKey = questionTypeNode.fieldNames().next();
            String questionType = questionTypeNode.get(questionKey).asText();

            int questionNumber = extractQuestionNumber(questionKey);
            Section section = questionToSectionMap.get(questionNumber);

            if (section == null) {
                log.warn("No section found for question {}", questionNumber);
                continue;
            }

            // Lấy đáp án
            String correctAnswer = extractAnswer(answersNode, questionNumber);

            // Tạo Question
            createQuestion(section, questionNumber, questionType, correctAnswer);
            totalQuestions++;
        }

        return totalQuestions;
    }

    /**
     * Map câu hỏi với section dựa trên question_range
     */
    private Map<Integer, Section> mapQuestionsToSections(List<Section> sections) {
        Map<Integer, Section> map = new HashMap<>();

        // Listening thường có 10 câu hỏi mỗi section
        int questionsPerSection = 10;

        for (Section section : sections) {
            int startQuestion = (section.getOrderIndex() - 1) * questionsPerSection + 1;
            int endQuestion = section.getOrderIndex() * questionsPerSection;

            for (int q = startQuestion; q <= endQuestion; q++) {
                map.put(q, section);
            }

            log.info("Mapped questions {}-{} to section {}",
                    startQuestion, endQuestion, section.getOrderIndex());
        }

        return map;
    }

    /**
     * Trích xuất số thứ tự câu hỏi từ key
     */
    private int extractQuestionNumber(String questionKey) {
        Pattern pattern = Pattern.compile("Question_(\\d+)");
        Matcher matcher = pattern.matcher(questionKey);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        return 0;
    }

    /**
     * Trích xuất test number từ title
     */
    private int extractTestNumber(String title) {
        Pattern pattern = Pattern.compile("Test\\s+(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(title);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        return 1; // Default
    }

    /**
     * Trích xuất đáp án từ answers node
     */
    private String extractAnswer(JsonNode answersNode, int questionNumber) {
        if (!answersNode.isArray()) {
            return "";
        }

        for (JsonNode answerNode : answersNode) {
            int answerQuestionNumber = answerNode.path("question_number").asInt();
            if (answerQuestionNumber == questionNumber) {
                return answerNode.path("answer_text").asText("");
            }
        }

        return "";
    }

    /**
     * Tạo Question entity
     */
    private Question createQuestion(Section section, int questionNumber,
                                    String questionType, String correctAnswer) {
        Map<String, Object> content = new HashMap<>();
        content.put("questionNumber", questionNumber);
        content.put("correctAnswer", correctAnswer);
        content.put("type", questionType);

        Question question = Question.builder()
                .section(section)
                .type(mapQuestionType(questionType))
                .content(content)
                .difficult("Medium")
                .script(null)
                .isActive(true)
                .status(Status.Published)
                .build();

        return questionRepository.save(question);
    }

    /**
     * Map mã type sang tên đầy đủ
     */
    private String mapQuestionType(String typeCode) {
        Map<String, String> typeMapping = new HashMap<>();
        typeMapping.put("SA", "Short Answer");
        typeMapping.put("MC", "Multiple Choice");
        typeMapping.put("TB", "Table Completion");
        typeMapping.put("MP", "Map/Plan Labeling");
        typeMapping.put("MT", "Matching");
        typeMapping.put("SC", "Sentence Completion");
        typeMapping.put("FC", "Form Completion");
        typeMapping.put("NC", "Note Completion");

        return typeMapping.getOrDefault(typeCode, typeCode);
    }
}