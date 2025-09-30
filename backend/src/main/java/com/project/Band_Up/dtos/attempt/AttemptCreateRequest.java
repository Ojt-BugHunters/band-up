package com.project.Band_Up.dtos.attempt;

import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptCreateRequest {
    private LocalDateTime startAt;
}
