package com.project.Band_Up.dtos.answer;

import com.project.Band_Up.enums.DictationMistake;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MistakeDetailDto {
    private DictationMistake type;
    private String from;
    private String to;
    private String word;
}

