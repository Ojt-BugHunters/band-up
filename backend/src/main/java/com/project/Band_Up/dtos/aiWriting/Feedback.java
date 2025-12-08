package com.project.Band_Up.dtos.aiWriting;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Feedback {

    private String overall;
    private List<String> strengths;
    private List<String> weaknesses;

    @JsonProperty("task_achievement")
    private TaskAchievement taskAchievement;

    private Coherence coherence;
    private Lexical lexical;
    private Grammar grammar;

    private List<String> recommendations;

    @JsonProperty("quoted_examples")
    private List<QuotedExample> quotedExamples;
}
