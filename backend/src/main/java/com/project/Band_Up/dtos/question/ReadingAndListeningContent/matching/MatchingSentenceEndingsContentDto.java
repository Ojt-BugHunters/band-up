package com.project.Band_Up.dtos.question.ReadingAndListeningContent.matching;

import java.util.List;

public class MatchingSentenceEndingsContentDto {
    private List<String> sentenceBeginnings; // HTML
    private List<String> sentenceEndings;    // HTML

    /**
     * answers[i] = index câu ending ứng với beginnings[i]
     * có thể null nếu đề cho skip
     */
    private List<Integer> answers;

    private String explanationHtml;
}
