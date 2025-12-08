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
public class CrawWritingTestService {

    private final TestRepository testRepository;
    private final SectionRepository sectionRepository;
    private final QuestionRepository questionRepository;
    private final AccountRepository accountRepository;
    private final ObjectMapper objectMapper;
    private final CrawTestConfiguration config;

    // Folder path riêng cho Writing tests
    private static final String WRITING_FOLDER_PATH = "D:\\Crawling-test\\band-up-feature-crawling\\crawler\\web_scraping\\parsed\\writing\\practice";
    private static final String WRITING_FILE_PREFIX = "writing_test_";
    private static final String FILE_SUFFIX = ".json";
    private static final int WRITING_TEST_DURATION = 3600; // 60 minutes

    /**
     * Import tất cả Writing tests từ folder
     */
    @Transactional
    public List<String> importAllWritingTests(UUID adminUserId) {
        List<String> results = new ArrayList<>();

        try {
            Path folderPath = Paths.get(WRITING_FOLDER_PATH);
            if (!Files.exists(folderPath)) {
                throw new RuntimeException("Folder not found: " + WRITING_FOLDER_PATH);
            }

            try (DirectoryStream<Path> stream = Files.newDirectoryStream(folderPath, "*.json")) {
                for (Path filePath : stream) {
                    String fileName = filePath.getFileName().toString();
                    if (fileName.startsWith(WRITING_FILE_PREFIX) && fileName.endsWith(FILE_SUFFIX)) {
                        try {
                            String result = importSingleWritingTest(filePath.toFile(), adminUserId);
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
     * Import nhiều Writing tests theo danh sách số thứ tự
     */
    @Transactional
    public List<String> importBatchWritingTests(List<String> testNumbers, UUID adminUserId) {
        List<String> results = new ArrayList<>();

        for (String testNumber : testNumbers) {
            String fileName = String.format("%s%s%s", WRITING_FILE_PREFIX, testNumber, FILE_SUFFIX);
            File file = new File(WRITING_FOLDER_PATH + File.separator + fileName);

            try {
                if (!file.exists()) {
                    results.add("✗ " + fileName + ": File not found");
                    continue;
                }

                String result = importSingleWritingTest(file, adminUserId);
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
     * Import một Writing test từ file JSON
     */
    @Transactional
    public String importSingleWritingTest(File jsonFile, UUID adminUserId) throws IOException {
        // 1. Đọc JSON file
        JsonNode rootNode = objectMapper.readTree(jsonFile);

        // 2. Validate JSON structure
        if (!validateWritingJson(rootNode)) {
            throw new RuntimeException("Invalid Writing test JSON structure");
        }

        // 3. Lấy thông tin admin user
        Account admin = accountRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        // 4. Tạo Test
        Test test = createWritingTest(rootNode, admin);

        // 5. Tạo Sections (Task 1 và Task 2)
        List<Section> sections = createWritingSections(rootNode, test);

        // 6. Tạo Questions (mỗi task có 1 question)
        int totalQuestions = createWritingQuestions(rootNode, sections);

        return String.format("Writing Test '%s' created with %d tasks and %d questions",
                test.getTitle(), sections.size(), totalQuestions);
    }

    /**
     * Validate JSON structure
     */
    private boolean validateWritingJson(JsonNode rootNode) {
        JsonNode validation = rootNode.path("validation");
        if (validation.isMissingNode()) {
            log.warn("No validation node found");
            return false;
        }

        boolean isValid = validation.path("is_valid").asBoolean(false);
        boolean task1HasContent = validation.path("task1_has_content").asBoolean(false);
        boolean task2HasContent = validation.path("task2_has_content").asBoolean(false);

        if (!isValid || !task1HasContent || !task2HasContent) {
            log.error("Invalid writing test: isValid={}, task1={}, task2={}",
                    isValid, task1HasContent, task2HasContent);
            return false;
        }

        return true;
    }

    /**
     * Tạo Writing Test entity
     */
    private Test createWritingTest(JsonNode rootNode, Account admin) {
        JsonNode metadataNode = rootNode.path("test_metadata");

        String testName = metadataNode.path("test_name").asText("Unknown Writing Test");
        int testNumber = metadataNode.path("test_number").asInt(0);

        String title = testName;
        if (testNumber > 0) {
            title = String.format("IELTS Writing Practice Test %02d", testNumber);
        }

        Test test = Test.builder()
                .user(admin)
                .skillName("Writing")
                .title(title)
                .numberOfPeople(0)
                .durationSeconds(BigInteger.valueOf(WRITING_TEST_DURATION))
                .difficult("Medium")
                .status(Status.Published)
                .build();

        return testRepository.save(test);
    }

    /**
     * Tạo Sections cho Writing test (Task 1 và Task 2)
     */
    private List<Section> createWritingSections(JsonNode rootNode, Test test) {
        List<Section> sections = new ArrayList<>();
        JsonNode tasksNode = rootNode.path("tasks");

        if (!tasksNode.isArray() || tasksNode.size() == 0) {
            log.error("No tasks found in Writing test JSON");
            return sections;
        }

        for (int i = 0; i < tasksNode.size(); i++) {
            JsonNode taskNode = tasksNode.get(i);

            int taskNumber = taskNode.path("task_number").asInt(i + 1);
            String taskTitle = taskNode.path("title").asText("Writing Task " + taskNumber);
            String instruction = taskNode.path("instruction").asText("");
            String contentHtml = taskNode.path("content_html").asText("");

            // Tính thời gian cho mỗi task
            int taskDuration = (taskNumber == 1) ? 1200 : 2400; // Task 1: 20 mins, Task 2: 40 mins

            // Tạo metadata chứa HTML content và instruction
            String metadata = createWritingSectionMetadata(contentHtml, instruction, taskNode);

            Section section = Section.builder()
                    .test(test)
                    .title(taskTitle)
                    .orderIndex(taskNumber)
                    .timeLimitSeconds(BigInteger.valueOf(taskDuration))
                    .metadata(metadata)
                    .status(Status.Published)
                    .build();

            sections.add(sectionRepository.save(section));
            log.info("Created section {}: {} ({} seconds)",
                    taskNumber, taskTitle, taskDuration);
        }

        return sections;
    }

    /**
     * Tạo metadata cho Writing section
     */
    private String createWritingSectionMetadata(String contentHtml, String instruction, JsonNode taskNode) {
        try {
            Map<String, Object> metadata = new HashMap<>();

            // Lưu HTML content
            metadata.put("htmlContent", cleanHtmlContent(contentHtml));

            // Lưu instruction
            metadata.put("instruction", instruction);

            // Lưu task type
            int taskNumber = taskNode.path("task_number").asInt(0);
            metadata.put("taskNumber", taskNumber);
            metadata.put("taskType", taskNumber == 1 ? "Academic/General Writing Task 1" : "Writing Task 2");

            // Thêm thông tin về images (nếu có)
            JsonNode imagesNode = taskNode.path("images");
            if (imagesNode.isArray() && imagesNode.size() > 0) {
                List<String> imageUrls = new ArrayList<>();
                for (JsonNode imageNode : imagesNode) {
                    imageUrls.add(imageNode.asText());
                }
                metadata.put("images", imageUrls);
                metadata.put("hasImages", true);
            } else {
                metadata.put("hasImages", false);
            }

            // Word count requirements
            if (taskNumber == 1) {
                metadata.put("minWords", 150);
            } else {
                metadata.put("minWords", 250);
            }

            // Content text (để tìm kiếm)
            String contentText = taskNode.path("content_text").asText("");
            if (!contentText.isEmpty()) {
                metadata.put("contentText", contentText);
            }

            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            log.error("Error creating Writing section metadata: {}", e.getMessage());
            return "{}";
        }
    }

    /**
     * Clean HTML content (fix entities, format)
     */
    private String cleanHtmlContent(String html) {
        if (html == null || html.isEmpty()) {
            return "";
        }

        // Replace HTML entities
        html = html.replaceAll("&quot;", "\"");
        html = html.replaceAll("&amp;", "&");
        html = html.replaceAll("&nbsp;", " ");
        html = html.replaceAll("&lt;", "<");
        html = html.replaceAll("&gt;", ">");

        return html.trim();
    }

    /**
     * Tạo Questions cho Writing test
     */
    private int createWritingQuestions(JsonNode rootNode, List<Section> sections) {
        int totalQuestions = 0;
        JsonNode tasksNode = rootNode.path("tasks");

        if (!tasksNode.isArray() || sections.isEmpty()) {
            log.error("Cannot create questions: no tasks or sections");
            return 0;
        }

        for (int i = 0; i < tasksNode.size() && i < sections.size(); i++) {
            JsonNode taskNode = tasksNode.get(i);
            Section section = sections.get(i);

            // Lấy question content
            String questionText = taskNode.path("question").asText("");
            if (questionText.isEmpty()) {
                questionText = taskNode.path("instruction").asText("");
            }

            // Tạo Question content
            Map<String, Object> questionContent = new HashMap<>();
            questionContent.put("taskNumber", taskNode.path("task_number").asInt(i + 1));
            questionContent.put("question", questionText);
            questionContent.put("type", "Essay Writing");
            questionContent.put("instruction", taskNode.path("instruction").asText(""));

            // Thêm word count requirement
            int taskNumber = taskNode.path("task_number").asInt(1);
            questionContent.put("minWords", taskNumber == 1 ? 150 : 250);

            // Tạo Question entity
            Question question = Question.builder()
                    .section(section)
                    .type("Essay Writing")
                    .content(questionContent)
                    .difficult("Medium")
                    .script(null)
                    .isActive(true)
                    .status(Status.Published)
                    .build();

            questionRepository.save(question);
            totalQuestions++;

            log.info("Created question for Task {}: {}",
                    taskNumber, questionText.substring(0, Math.min(50, questionText.length())));
        }

        return totalQuestions;
    }

    /**
     * Import single test by test number
     */
    @Transactional
    public String importWritingTestByNumber(String testNumber, UUID adminUserId) throws IOException {
        String fileName = String.format("%s%s%s", WRITING_FILE_PREFIX, testNumber, FILE_SUFFIX);
        File file = new File(WRITING_FOLDER_PATH + File.separator + fileName);

        if (!file.exists()) {
            throw new RuntimeException("Writing test file not found: " + fileName);
        }

        return importSingleWritingTest(file, adminUserId);
    }

    /**
     * Get test info without importing
     */
    public Map<String, Object> getWritingTestInfo(String testNumber) throws IOException {
        String fileName = String.format("%s%s%s", WRITING_FILE_PREFIX, testNumber, FILE_SUFFIX);
        File file = new File(WRITING_FOLDER_PATH + File.separator + fileName);

        if (!file.exists()) {
            throw new RuntimeException("Writing test file not found: " + fileName);
        }

        JsonNode rootNode = objectMapper.readTree(file);
        JsonNode metadataNode = rootNode.path("test_metadata");
        JsonNode validationNode = rootNode.path("validation");

        Map<String, Object> info = new HashMap<>();
        info.put("testNumber", metadataNode.path("test_number").asInt(0));
        info.put("testName", metadataNode.path("test_name").asText(""));
        info.put("sourceUrl", metadataNode.path("source_url").asText(""));
        info.put("totalTasks", metadataNode.path("total_tasks").asInt(0));
        info.put("isValid", validationNode.path("is_valid").asBoolean(false));
        info.put("task1HasImages", validationNode.path("task1_has_images").asBoolean(false));

        return info;
    }
}
