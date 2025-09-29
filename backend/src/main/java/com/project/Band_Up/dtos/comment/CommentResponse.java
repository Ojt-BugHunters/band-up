package com.project.Band_Up.dtos.comment;

import lombok.*;

import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private UUID id;
    private UUID userId;
    private UUID testId;
    private String content;
}
