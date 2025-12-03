package com.project.Band_Up.dtos.question.ReadingAndListeningContent.shortAnswer;

import java.util.List;

public class ShortAnswerContentDto {
    private String questionHtml; // HTML câu hỏi

    /**
     * Chỉ một câu trả lời đúng (hoặc chuỗi synonyms BE handle separately)
     */
    private String correctAnswer;

    private String explanationHtml;
}
