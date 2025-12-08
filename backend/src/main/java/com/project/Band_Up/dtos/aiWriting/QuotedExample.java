package com.project.Band_Up.dtos.aiWriting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuotedExample {
    private String quote;
    private String issue;
    private String suggestion;
}
