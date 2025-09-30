package com.project.Band_Up.dtos.attemptSection;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptSectionResponse {
    private UUID id;
    private UUID attemptId;
    private UUID sectionId;
    private LocalDateTime startAt;
}
