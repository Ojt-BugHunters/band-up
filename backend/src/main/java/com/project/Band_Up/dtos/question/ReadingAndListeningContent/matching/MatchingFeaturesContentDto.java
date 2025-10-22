package com.project.Band_Up.dtos.question.ReadingAndListeningContent.matching;

import java.util.List;

public class MatchingFeaturesContentDto {
    /**
     * Danh sách features gốc (ví dụ: tên người A,B,C hoặc nhà nghiên cứu)
     */
    private List<String> features;

    /**
     * Danh sách items để match (các quan điểm / ý kiến)
     */
    private List<String> items;

    /**
     * answers[i] = index trong `features` tương ứng cho items[i]
     */
    private List<Integer> answers;

    private String explanationHtml;
}
