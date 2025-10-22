package com.project.Band_Up.dtos.blog;

import lombok.*;

import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BlogAuthor {
    private UUID id;
    private String name;
    private String avatar;
}
