package com.project.Band_Up.dtos.aiWriting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TaskAchievement {
    private Double band;
    private String feedback;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> improvements;
}
