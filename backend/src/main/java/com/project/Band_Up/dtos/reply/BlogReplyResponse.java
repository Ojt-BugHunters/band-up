package com.project.Band_Up.dtos.reply;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogReplyResponse {
    private UUID id;
    private String content;
    private LocalDateTime createAt;
}