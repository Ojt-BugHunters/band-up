package com.project.Band_Up.configs;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration cho việc import test từ file JSON
 */
@Configuration
@ConfigurationProperties(prefix = "craw-test")
@Data
public class CrawTestConfiguration {

    /**
     * Đường dẫn tới folder chứa file JSON
     * Mặc định: D:\Crawling-test\band-up-feature-crawling\crawler\web_scraping\parsed_enhanced\reading\practice
     */
    private String folderPath = "D:\\Crawling-test\\band-up-feature-crawling\\crawler\\web_scraping\\parsed_enhanced\\reading\\practice";

    /**
     * Prefix của file name
     * Mặc định: parsed_ielts-reading-practice-test-
     */
    private String filePrefix = "parsed_ielts-reading-practice-test-";

    /**
     * Suffix của file name
     * Mặc định: -with-answers.json
     */
    private String fileSuffix = "-with-answers.json";

    /**
     * Thời gian giới hạn mặc định cho test (giây)
     * Mặc định: 3600 (60 phút)
     */
    private Long defaultTestDuration = 3600L;

    /**
     * Thời gian giới hạn mặc định cho mỗi section (giây)
     * Mặc định: 1200 (20 phút)
     */
    private Long defaultSectionDuration = 1200L;

    /**
     * Độ khó mặc định
     * Mặc định: Medium
     */
    private String defaultDifficulty = "Medium";
}
