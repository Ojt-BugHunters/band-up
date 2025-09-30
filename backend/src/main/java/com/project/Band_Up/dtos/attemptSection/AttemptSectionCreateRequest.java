package com.project.Band_Up.dtos.attemptSection;

import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptSectionCreateRequest {
    private LocalDateTime startAt;
}
