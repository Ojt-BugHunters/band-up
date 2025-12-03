package com.project.Band_Up.dtos.task;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TaskResponse {
    private UUID id;
    private UUID userId;
    private String title;
    private String description;
    private Boolean completed;
    private LocalDateTime createAt;
}
