package com.project.Band_Up.dtos.question.speakingContent;

import java.util.List;

public class SpeakingPart2ContentDto {
    private String topicHtml;

    /**
     * Danh sách các bullet hướng dẫn nói (HTML)
     */
    private List<String> bulletPointsHtml;

    /**
     * Giới hạn thời gian (FE hiển thị timer)
     */
    private Integer maxSeconds;

    private String explanationHtml;
}
