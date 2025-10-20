package com.project.Band_Up.dtos.question.ReadingAndListeningContent.completion;

import java.util.List;

public class CompletionContentDto {
    /**
     * Mô tả / instruction (HTML)
     * Ví dụ: "<p>Complete the summary below.</p>"
     */
    private String instructionHtml;

    /**
     * Các chỗ trống tương ứng thứ tự
     * FE dùng để render form
     */
    private List<String> blanksOrderHints;

    /**
     * Đáp án đúng cho từng blank
     */
    private List<String> correctAnswers;

    private String explanationHtml;
}
