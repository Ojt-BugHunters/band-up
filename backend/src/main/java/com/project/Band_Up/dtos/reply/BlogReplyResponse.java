package com.project.Band_Up.dtos.reply;

import com.project.Band_Up.dtos.comment.CommentAuthor;
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
    private CommentAuthor author;
    private String content;
    private LocalDateTime createAt;
}