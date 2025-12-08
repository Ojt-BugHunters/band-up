package com.project.Band_Up.dtos.aiWriting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AiWritingScoreRequest {
    private UUID section_id;
    private UUID user_id;
    private String essay_content;
    private String task_type;
    private String prompt;
    private Integer word_count;
}
