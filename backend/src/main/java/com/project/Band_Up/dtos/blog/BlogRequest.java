package com.project.Band_Up.dtos.blog;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BlogRequest {
    private String title;
    private String titleImg;
    private String content;
    private List<TagDto> tags;
}
