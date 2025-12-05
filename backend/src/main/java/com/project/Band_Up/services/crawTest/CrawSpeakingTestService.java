package com.project.Band_Up.services.crawTest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Question;
import com.project.Band_Up.entities.Section;
import com.project.Band_Up.entities.Test;
import com.project.Band_Up.enums.Status;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.QuestionRepository;
import com.project.Band_Up.repositories.SectionRepository;
import com.project.Band_Up.repositories.TestRepository;
import com.project.Band_Up.configs.CrawTestConfiguration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class CrawSpeakingTestService {

    private final TestRepository testRepository;
    private final SectionRepository sectionRepository;
    private final QuestionRepository questionRepository;
    private final AccountRepository accountRepository;
    private final ObjectMapper objectMapper;
    private final CrawTestConfiguration config;

    /**
     * Import tất cả file JSON Speaking từ folder
     */
    @Transactional
    public List<String> importAllSpeakingTests(UUID adminUserId) {
        List<String> results = new ArrayList<>();

        try {
            // Đường dẫn folder speaking
            String folderPath = "D:\\Crawling-test\\band-up-feature-crawling\\crawler\\web_scraping\\parsed\\speaking\\practice";
            Path folder = Paths.get(folderPath);

            if (!Files.exists(folder)) {
                throw new RuntimeException("Folder not found: " + folderPath);
            }

            log.info("Scanning folder: {}", folderPath);

            try (DirectoryStream<Path> stream = Files.newDirectoryStream(folder, "*.json")) {
                for (Path filePath : stream) {
                    String fileName = filePath.getFileName().toString();
                    try {
                        String result = importSingleSpeakingTest(filePath.toFile(), adminUserId);
                        results.add("✓ " + fileName + ": " + result);
                        log.info("Successfully imported: {}", fileName);
                    } catch (Exception e) {
                        results.add("✗ " + fileName + ": " + e.getMessage());
                        log.error("Failed to import {}: {}", fileName, e.getMessage(), e);
                    }
                }
            }

            if (results.isEmpty()) {
                results.add("No JSON files found in folder");
            }

        } catch (IOException e) {
            throw new RuntimeException("Error reading folder: " + e.getMessage());
        }

        return results;
    }

    /**
     * Import một file JSON Speaking cụ thể
     */
    @Transactional
    public String importSingleSpeakingTest(File jsonFile, UUID adminUserId) throws IOException {
        log.info("Importing speaking test from file: {}", jsonFile.getName());

        // 1. Đọc JSON file
        JsonNode rootNode = objectMapper.readTree(jsonFile);

        // 2. Lấy thông tin admin user
        Account admin = accountRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        // 3. Tạo Test
        Test test = createSpeakingTest(rootNode, admin);
        log.info("Created test: {}", test.getTitle());

        // 4. Tạo Sections (Parts)
        List<Section> sections = createSpeakingSections(rootNode, test);
        log.info("Created {} sections", sections.size());

        // 5. Tạo Questions
        int totalQuestions = createSpeakingQuestions(rootNode, sections);
        log.info("Created {} questions", totalQuestions);

        return String.format("Test '%s' created with %d parts and %d questions",
                test.getTitle(), sections.size(), totalQuestions);
    }

    /**
     * Tạo Speaking Test từ JSON
     */
    private Test createSpeakingTest(JsonNode rootNode, Account admin) {
        JsonNode metadataNode = rootNode.path("test_metadata");

        String testName = metadataNode.path("test_name").asText("Unknown Test");
        int testNumber = metadataNode.path("test_number").asInt(0);

        String title = testName;
        if (testNumber > 0) {
            title = String.format("IELTS Speaking Practice Test %02d", testNumber);
        }

        Test test = Test.builder()
                .user(admin)
                .skillName("Speaking")
                .title(title)
                .numberOfPeople(0)
                .durationSeconds(BigInteger.valueOf(900)) // 15 phút mặc định
                .difficult("Medium")
                .status(Status.Published)
                .build();

        return testRepository.save(test);
    }

    /**
     * Tạo Sections từ parts array
     */
    private List<Section> createSpeakingSections(JsonNode rootNode, Test test) {
        List<Section> sections = new ArrayList<>();
        JsonNode partsNode = rootNode.path("parts");

        if (!partsNode.isArray() || partsNode.size() == 0) {
            log.warn("No parts found in JSON");
            return sections;
        }

        log.info("Processing {} parts", partsNode.size());

        for (JsonNode partNode : partsNode) {
            int partNumber = partNode.path("part_number").asInt(0);
            String title = partNode.path("title").asText("Part " + partNumber);
            String contentHtml = partNode.path("content_html").asText("");

            // Tạo metadata chứa HTML content
            String metadata = createSectionMetadata(contentHtml, partNode);

            Section section = Section.builder()
                    .test(test)
                    .title(title)
                    .orderIndex(partNumber)
                    .timeLimitSeconds(BigInteger.valueOf(getPartDuration(partNumber)))
                    .metadata(metadata)
                    .status(Status.Published)
                    .build();

            sections.add(sectionRepository.save(section));
            log.info("Created section: {} (Part {})", title, partNumber);
        }

        return sections;
    }

    /**
     * Tính thời gian cho mỗi part
     */
    private long getPartDuration(int partNumber) {
        switch (partNumber) {
            case 1: return 240; // 4-5 phút
            case 2: return 180; // 3-4 phút (1 phút chuẩn bị + 2 phút nói)
            case 3: return 300; // 4-5 phút
            default: return 240;
        }
    }

    /**
     * Tạo metadata cho section
     */
    private String createSectionMetadata(String htmlContent, JsonNode partNode) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("htmlContent", htmlContent);
            metadata.put("topic", partNode.path("topic").asText(""));

            // Thêm cue points nếu có (Part 2)
            JsonNode questionsNode = partNode.path("questions");
            if (questionsNode.isArray() && questionsNode.size() > 0) {
                JsonNode firstQuestion = questionsNode.get(0);
                if (firstQuestion.has("cue_points")) {
                    List<String> cuePoints = new ArrayList<>();
                    firstQuestion.path("cue_points").forEach(node -> cuePoints.add(node.asText()));
                    metadata.put("cuePoints", cuePoints);
                }
            }

            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            log.error("Error creating metadata: {}", e.getMessage());
            return "{}";
        }
    }

    /**
     * Tạo Questions từ parts
     */
    private int createSpeakingQuestions(JsonNode rootNode, List<Section> sections) {
        int totalQuestions = 0;
        JsonNode partsNode = rootNode.path("parts");

        if (!partsNode.isArray()) {
            return 0;
        }

        for (int i = 0; i < partsNode.size(); i++) {
            JsonNode partNode = partsNode.get(i);
            Section section = sections.get(i);

            JsonNode questionsNode = partNode.path("questions");
            if (!questionsNode.isArray()) {
                continue;
            }

            int questionNumber = 1;
            for (JsonNode questionNode : questionsNode) {
                String questionText = questionNode.path("question").asText("");
                String sampleAnswer = questionNode.path("sample_answer").asText("");

                if (questionText.isEmpty()) {
                    continue;
                }

                // Tạo content cho question
                Map<String, Object> content = new HashMap<>();
                content.put("question", questionText);
                content.put("sampleAnswer", sampleAnswer);
                content.put("questionNumber", questionNumber);

                // Thêm cue points nếu có (Part 2)
                if (questionNode.has("cue_points")) {
                    List<String> cuePoints = new ArrayList<>();
                    questionNode.path("cue_points").forEach(node -> cuePoints.add(node.asText()));
                    content.put("cuePoints", cuePoints);
                }

                Question question = Question.builder()
                        .section(section)
                        .type("Speaking Question")
                        .content(content)
                        .difficult("Medium")
                        .script(sampleAnswer) // Lưu sample answer vào script
                        .isActive(true)
                        .status(Status.Published)
                        .build();

                questionRepository.save(question);
                totalQuestions++;
                questionNumber++;
            }
        }

        return totalQuestions;
    }
}