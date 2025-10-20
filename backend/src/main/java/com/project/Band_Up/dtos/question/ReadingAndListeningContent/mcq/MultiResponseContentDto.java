package com.project.Band_Up.dtos.question.ReadingAndListeningContent.mcq;

import java.util.List;

public class MultiResponseContentDto {
    private String questionHtml;
    private List<String> options;
    private List<Integer> correctIndexes;
    private String explanationHtml;
}
