package com.project.Band_Up.dtos.blog;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BlogPosts {
    private UUID id;
    private String titleImg;
    private BlogAuthor author;
    private List<TagDto> tags;
    private List<ReactDto> blogReacts;
    private long numberOfReaders;
    private long numberOfComments;
    private LocalDateTime publishedDate;
}
