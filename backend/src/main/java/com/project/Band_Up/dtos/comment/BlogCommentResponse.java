package com.project.Band_Up.dtos.comment;

import com.project.Band_Up.dtos.reply.BlogReplyResponse;
import com.project.Band_Up.entities.Comment;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogCommentResponse {
    private UUID id;
    private CommentAuthor author;
    private UUID blogId;
    private String content;
    private List<BlogReplyResponse> replies;
    private LocalDateTime createAt;
}
