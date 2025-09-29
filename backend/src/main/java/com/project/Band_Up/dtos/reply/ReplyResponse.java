package com.project.Band_Up.dtos.reply;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplyResponse {
    private UUID id;
    private UUID commentId;
    private UUID userId;
    private String content;
    private LocalDateTime createAt;
}
