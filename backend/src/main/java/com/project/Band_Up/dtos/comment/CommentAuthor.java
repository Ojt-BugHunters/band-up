package com.project.Band_Up.dtos.comment;

import lombok.*;

import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentAuthor {
    private UUID id;
    private String name;
    private String avatar;
}