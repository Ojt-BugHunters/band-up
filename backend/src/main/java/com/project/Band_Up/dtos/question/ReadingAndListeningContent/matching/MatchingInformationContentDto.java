package com.project.Band_Up.dtos.question.ReadingAndListeningContent.matching;

import java.util.List;

public class MatchingInformationContentDto {
    /**
     * Danh sách paragraph labels (A,B,C,...)
     */
    private List<String> paragraphs;
    /**
     * Danh sách thông tin cần match (HTML)
     */
    private List<String> informationItems;
    private List<Integer> answers;
    private String explanationHtml;
}
