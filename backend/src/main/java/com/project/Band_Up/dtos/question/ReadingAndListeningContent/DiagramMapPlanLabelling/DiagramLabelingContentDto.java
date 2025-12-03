package com.project.Band_Up.dtos.question.ReadingAndListeningContent.DiagramMapPlanLabelling;

import java.util.List;

public class DiagramLabelingContentDto {
    private String imageUrl; // S3 / CloudFront link

    /**
     * Labels xuất hiện trên hình (A,B,C hoặc number slots)
     */
    private List<String> targets;

    /**
     * Đáp án text tương ứng mỗi target
     */
    private List<String> correctAnswers;

    private String explanationHtml;
}
