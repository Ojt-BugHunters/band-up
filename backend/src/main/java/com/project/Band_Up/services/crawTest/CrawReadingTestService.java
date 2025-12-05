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
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
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
public class CrawReadingTestService {

    private final TestRepository testRepository;
    private final SectionRepository sectionRepository;
    private final QuestionRepository questionRepository;
    private final AccountRepository accountRepository;
    private final ObjectMapper objectMapper;
    private final CrawTestConfiguration config;

    /**
     * Import tất cả file JSON từ folder
     */
    @Transactional
    public List<String> importAllTests(UUID adminUserId) {
        List<String> results = new ArrayList<>();

        try {
            Path folderPath = Paths.get(config.getFolderPath());
            if (!Files.exists(folderPath)) {
                throw new RuntimeException("Folder not found: " + config.getFolderPath());
            }

            try (DirectoryStream<Path> stream = Files.newDirectoryStream(folderPath, "*.json")) {
                for (Path filePath : stream) {
                    String fileName = filePath.getFileName().toString();
                    if (fileName.startsWith(config.getFilePrefix()) && fileName.endsWith(config.getFileSuffix())) {
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
            String fileName = String.format("%s%s%s", config.getFilePrefix(), testNumber, config.getFileSuffix());
            File file = new File(config.getFolderPath() + File.separator + fileName);

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

        // 4. Tạo Sections (Passages)
        List<Section> sections = createSections(rootNode, test);

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
        int testNumber = metadataNode.path("test_number").asInt(0);

        String title = testName;
        if (testNumber > 0) {
            title = String.format("IELTS Reading Practice Test %02d", testNumber);
        }

        Test test = Test.builder()
                .user(admin)
                .skillName("Reading")
                .title(title)
                .numberOfPeople(0)
                .durationSeconds(BigInteger.valueOf(config.getDefaultTestDuration()))
                .difficult(config.getDefaultDifficulty())
                .status(Status.Published)
                .build();

        return testRepository.save(test);
    }

    /**
     * Tạo Sections từ HTML content
     */
    private List<Section> createSections(JsonNode rootNode, Test test) {
        List<Section> sections = new ArrayList<>();
        JsonNode passagesNode = rootNode.path("passages");

        if (!passagesNode.isArray() || passagesNode.size() == 0) {
            log.warn("No passages found in JSON");
            return sections;
        }

        // Lấy passage đầu tiên (chứa toàn bộ HTML)
        JsonNode firstPassage = passagesNode.get(0);
        String fullHtmlContent = firstPassage.path("content").asText("");

        if (fullHtmlContent.isEmpty()) {
            log.warn("No HTML content found in first passage");
            return sections;
        }

        log.info("Processing HTML content ({} characters)", fullHtmlContent.length());

        // Parse HTML và tách thành 3 passages
        List<PassageContent> passageContents = extractPassagesFromHtml(fullHtmlContent);

        if (passageContents.isEmpty()) {
            log.error("Failed to extract any passages from HTML!");
            return sections;
        }

        // Tạo Section cho mỗi passage
        for (int i = 0; i < passageContents.size(); i++) {
            PassageContent passageContent = passageContents.get(i);

            Section section = Section.builder()
                    .test(test)
                    .title(passageContent.getTitle())
                    .orderIndex(i + 1)
                    .timeLimitSeconds(BigInteger.valueOf(config.getDefaultSectionDuration()))
                    .metadata(createSectionMetadata(passageContent.getHtmlContent()))
                    .status(Status.Published)
                    .build();

            sections.add(sectionRepository.save(section));
            log.info("Created section {}: {} ({} chars)",
                    i + 1, passageContent.getTitle(), passageContent.getHtmlContent().length());
        }

        return sections;
    }

    /**
     * Tách HTML thành các passages - GIỮ NGUYÊN THỨ TỰ DOM
     */
    private List<PassageContent> extractPassagesFromHtml(String htmlContent) {
        List<PassageContent> passages = new ArrayList<>();

        try {
            Document doc = Jsoup.parse(htmlContent);
            Elements rows = doc.select("div.et_pb_row");

            log.info("Found {} rows in HTML", rows.size());

            for (Element row : rows) {
                // Tìm h3 chứa "READING PASSAGE"
                Elements passageHeaders = row.select("h3:contains(READING PASSAGE)");
                if (passageHeaders.isEmpty()) {
                    continue;
                }

                // Lấy số passage và title
                String headerText = passageHeaders.first().text();
                int passageNumber = extractPassageNumber(headerText);
                if (passageNumber == 0) {
                    continue;
                }

                String passageTitle = "Reading Passage " + passageNumber;
                Elements h2Elements = row.select("h2");
                if (!h2Elements.isEmpty()) {
                    passageTitle = h2Elements.first().text().trim();
                }

                // Bắt đầu thu thập HTML content THEO THỨ TỰ
                StringBuilder fullPassageHtml = new StringBuilder();
                fullPassageHtml.append("<div class='reading-passage'>\n");
                fullPassageHtml.append("<h2>").append(passageTitle).append("</h2>\n");

                // ==================== LẤY TẤT CẢ ELEMENTS THEO THỨ TỰ XUẤT HIỆN ====================
                Elements allParagraphs = row.select("p");
                Elements allH4 = row.select("h4");
                Elements allEm = row.select("em");
                Elements allImages = row.select("img");

                // Tạo danh sách elements với thứ tự DOM
                List<ElementWithOrder> orderedElements = new ArrayList<>();

                // Thêm paragraphs
                for (Element p : allParagraphs) {
                    String text = p.text().trim();
                    // Bỏ qua instruction
                    if (text.startsWith("You should spend")) continue;

                    orderedElements.add(new ElementWithOrder(p, getElementOrder(p)));
                }

                // Thêm h4
                for (Element h4 : allH4) {
                    orderedElements.add(new ElementWithOrder(h4, getElementOrder(h4)));
                }

                // Thêm em
                for (Element em : allEm) {
                    orderedElements.add(new ElementWithOrder(em, getElementOrder(em)));
                }

                // Thêm images (QUAN TRỌNG)
                for (Element img : allImages) {
                    orderedElements.add(new ElementWithOrder(img, getElementOrder(img)));
                }

                // Sắp xếp theo thứ tự DOM
                orderedElements.sort(Comparator.comparingInt(ElementWithOrder::getOrder));

                // ==================== PHÂN LOẠI VÀ THÊM VÀO HTML ====================
                boolean inPassageContent = false;
                boolean inQuestionsContent = false;

                for (ElementWithOrder elementWithOrder : orderedElements) {
                    Element element = elementWithOrder.getElement();
                    String text = element.text().trim();
                    String tagName = element.tagName();

                    // Phát hiện bắt đầu passage content (có marker A-I)
                    if (tagName.equals("p") && hasPassageMarker(element)) {
                        if (!inPassageContent) {
                            fullPassageHtml.append("\n<div class='passage-content'>\n");
                            inPassageContent = true;
                        }
                    }

                    // Phát hiện bắt đầu questions
                    if ((text.startsWith("Questions") || text.startsWith("Question")) &&
                            (tagName.equals("h4") || tagName.equals("p"))) {
                        if (inPassageContent) {
                            fullPassageHtml.append("</div>\n\n");
                            inPassageContent = false;
                        }
                        if (!inQuestionsContent) {
                            fullPassageHtml.append("<div class='questions-content'>\n");
                            inQuestionsContent = true;
                        }
                    }

                    // Thêm element vào đúng section
                    if (inPassageContent) {
                        // Thêm paragraph có marker, nội dung dài, HOẶC chứa images
                        if (tagName.equals("p") && (text.length() > 100 || hasPassageMarker(element) || element.select("img").size() > 0)) {
                            fullPassageHtml.append(formatElementForDisplay(element)).append("\n");
                        }
                        // THÊM standalone images trong passage content
                        else if (tagName.equals("img")) {
                            fullPassageHtml.append(formatImageElement(element)).append("\n");
                        }
                    } else if (inQuestionsContent) {
                        // Thêm tất cả elements trong questions section (bao gồm cả images)
                        if (tagName.equals("img")) {
                            fullPassageHtml.append(formatImageElement(element)).append("\n");
                        } else {
                            fullPassageHtml.append(formatElementForDisplay(element)).append("\n");
                        }
                    }
                }

                // Đóng các div còn mở
                if (inPassageContent) {
                    fullPassageHtml.append("</div>\n");
                }
                if (inQuestionsContent) {
                    fullPassageHtml.append("</div>\n");
                }

                fullPassageHtml.append("</div>\n");

                if (fullPassageHtml.length() > 200) {
                    int imageCount = fullPassageHtml.toString().split("<img").length - 1;
                    passages.add(new PassageContent(passageTitle, fullPassageHtml.toString()));
                    log.info("Extracted passage {}: {} ({} characters, {} images)",
                            passageNumber, passageTitle, fullPassageHtml.length(), imageCount);
                }
            }

        } catch (Exception e) {
            log.error("Error parsing HTML content: {}", e.getMessage(), e);
        }

        log.info("Total passages extracted: {}", passages.size());
        return passages;
    }

    /**
     * Lấy thứ tự của element trong DOM tree
     */
    private int getElementOrder(Element element) {
        int order = 0;
        Element current = element;

        while (current.previousElementSibling() != null) {
            order++;
            current = current.previousElementSibling();
        }

        // Thêm offset từ parent để đảm bảo thứ tự chính xác
        Element parent = element.parent();
        if (parent != null) {
            order += getElementOrder(parent) * 1000;
        }

        return order;
    }

    /**
     * Format image element và decode HTML entities
     */
    private String formatImageElement(Element img) {
        img.addClass("question-image");
        if (!img.hasAttr("style")) {
            img.attr("style", "max-width: 100%; height: auto; display: block; margin: 20px auto;");
        }

        // Lấy HTML và decode entities
        String imgHtml = img.outerHtml();
        imgHtml = fixImageSrc(imgHtml);

        return "<p class='image-wrapper'>\n" + imgHtml + "\n</p>";
    }

    /**
     * Format element để hiển thị (xử lý images)
     */
    private String formatElementForDisplay(Element element) {
        // Xử lý paragraph chứa images
        if (element.select("img").size() > 0) {
            Elements imgs = element.select("img");
            for (Element img : imgs) {
                img.addClass("question-image");
                if (!img.hasAttr("style")) {
                    img.attr("style", "max-width: 100%; height: auto; display: block; margin: 20px auto;");
                }
            }
        }

        // Lấy HTML và fix image src
        String html = element.outerHtml();
        html = fixImageSrc(html);

        return html;
    }

    /**
     * Fix image src: convert &quot; back to normal quotes
     */
    private String fixImageSrc(String html) {
        if (html == null || html.isEmpty()) {
            return html;
        }

        // Replace &quot; with " in img tags
        html = html.replaceAll("&quot;", "\"");

        // Replace other common entities if needed
        html = html.replaceAll("&amp;", "&");
        html = html.replaceAll("&nbsp;", " ");

        return html;
    }

    /**
     * Kiểm tra paragraph có marker A-I không
     */
    private boolean hasPassageMarker(Element element) {
        Elements strongs = element.select("strong");
        for (Element strong : strongs) {
            String text = strong.text().trim();
            if (text.matches("^[A-I]$")) {
                return true;
            }
        }
        return false;
    }

    /**
     * Inner class để lưu element với thứ tự
     */
    private static class ElementWithOrder {
        private final Element element;
        private final int order;

        public ElementWithOrder(Element element, int order) {
            this.element = element;
            this.order = order;
        }

        public Element getElement() {
            return element;
        }

        public int getOrder() {
            return order;
        }
    }

    /**
     * Trích xuất số passage từ header text
     */
    private int extractPassageNumber(String headerText) {
        Pattern pattern = Pattern.compile("READING PASSAGE\\s+(\\d+)");
        Matcher matcher = pattern.matcher(headerText);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        return 0;
    }

    /**
     * Tạo metadata chứa HTML content
     */
    private String createSectionMetadata(String htmlContent) {
        try {
            // Clean up HTML entities trước khi lưu
            htmlContent = fixImageSrc(htmlContent);

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("htmlContent", htmlContent);
            metadata.put("wordCount", countWords(htmlContent));
            metadata.put("hasImages", htmlContent.contains("<img"));

            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            log.error("Error creating metadata: {}", e.getMessage());
            return "{}";
        }
    }

    /**
     * Đếm số từ trong HTML content
     */
    private int countWords(String htmlContent) {
        try {
            Document doc = Jsoup.parse(htmlContent);
            String text = doc.text();
            return text.split("\\s+").length;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Inner class để lưu thông tin passage
     */
    private static class PassageContent {
        private final String title;
        private final String htmlContent;

        public PassageContent(String title, String htmlContent) {
            this.title = title;
            this.htmlContent = htmlContent;
        }

        public String getTitle() {
            return title;
        }

        public String getHtmlContent() {
            return htmlContent;
        }
    }

    /**
     * Tạo Questions từ questionTypes và answers
     */
    private int createQuestions(JsonNode rootNode, List<Section> sections) {
        int totalQuestions = 0;

        JsonNode questionTypesNode = rootNode.path("questionTypes");
        JsonNode answersNode = rootNode.path("answers");

        if (!questionTypesNode.isArray()) {
            return 0;
        }

        // Map để tracking passage boundaries
        Map<Integer, Section> questionToSectionMap = mapQuestionsToSections(questionTypesNode, sections);

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
            String correctAnswer = extractAnswer(answersNode, section.getOrderIndex(), questionNumber);

            // Tạo Question
            Question question = createQuestion(section, questionNumber, questionType, correctAnswer);
            totalQuestions++;
        }

        return totalQuestions;
    }

    /**
     * Map câu hỏi với section tương ứng
     */
    private Map<Integer, Section> mapQuestionsToSections(JsonNode questionTypesNode, List<Section> sections) {
        Map<Integer, Section> map = new HashMap<>();

        if (sections.isEmpty()) {
            log.error("No sections available to map questions!");
            return map;
        }

        int totalQuestions = questionTypesNode.size();
        int questionsPerSection = totalQuestions / sections.size();

        log.info("Mapping {} questions to {} sections ({} questions per section)",
                totalQuestions, sections.size(), questionsPerSection);

        for (int i = 0; i < questionTypesNode.size(); i++) {
            JsonNode node = questionTypesNode.get(i);
            String questionKey = node.fieldNames().next();
            int questionNumber = extractQuestionNumber(questionKey);

            // Xác định section index (0-based)
            int sectionIndex = (questionNumber - 1) / questionsPerSection;
            if (sectionIndex >= sections.size()) {
                sectionIndex = sections.size() - 1;
            }

            map.put(questionNumber, sections.get(sectionIndex));
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
     * Trích xuất đáp án từ answers node
     */
    private String extractAnswer(JsonNode answersNode, int passageIndex, int questionNumber) {
        String passageKey = "passage" + passageIndex;
        JsonNode passageAnswers = answersNode.path(passageKey);

        if (passageAnswers.has("answers") && passageAnswers.get("answers").isArray()) {
            JsonNode answersArray = passageAnswers.get("answers");

            // Calculate relative position in this passage
            int relativeIndex = calculateRelativeIndex(questionNumber, passageIndex);

            if (relativeIndex >= 0 && relativeIndex < answersArray.size()) {
                return answersArray.get(relativeIndex).asText("");
            }
        }

        return "";
    }

    /**
     * Tính index tương đối của câu hỏi trong passage
     */
    private int calculateRelativeIndex(int absoluteQuestionNumber, int passageIndex) {
        // Passage 1: Q1-13 (index 0-12)
        // Passage 2: Q14-26 (index 13-25)
        // Passage 3: Q27-40 (index 26-39)
        int baseQuestionNumber = (passageIndex - 1) * 13 + 1;
        return absoluteQuestionNumber - baseQuestionNumber;
    }

    /**
     * Tạo Question entity
     */
    private Question createQuestion(Section section, int questionNumber, String questionType, String correctAnswer) {
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
        typeMapping.put("TF", "True/False/Not Given");
        typeMapping.put("SA", "Short Answer");
        typeMapping.put("MC", "Multiple Choice");
        typeMapping.put("MF", "Matching Features");
        typeMapping.put("SC", "Sentence Completion");
        typeMapping.put("YN", "Yes/No/Not Given");

        return typeMapping.getOrDefault(typeCode, typeCode);
    }
}