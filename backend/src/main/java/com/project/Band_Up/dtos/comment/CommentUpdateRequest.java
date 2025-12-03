package com.project.Band_Up.dtos.comment;

import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentUpdateRequest {
    private String content;
}
