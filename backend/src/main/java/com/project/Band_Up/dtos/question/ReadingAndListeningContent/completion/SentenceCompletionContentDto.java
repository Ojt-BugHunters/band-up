package com.project.Band_Up.dtos.question.ReadingAndListeningContent.completion;

public class SentenceCompletionContentDto {
    /**
     * Câu hỏi chứa chỗ trống (HTML) — FE sẽ render blank
     * Ví dụ: "<p>Children learn best when they have ______.</p>"
     */
    private String sentenceHtml;

    /**
     * Đáp án đúng (1 từ/ cụm từ)
     */
    private String correctAnswer;

    private String explanationHtml;
}
