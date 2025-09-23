package com.project.Band_Up.dtos.section;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SectionUpdateRequest {
    private String title;
    private Integer orderIndex;
    private Map<String, Object> metadata;
}
