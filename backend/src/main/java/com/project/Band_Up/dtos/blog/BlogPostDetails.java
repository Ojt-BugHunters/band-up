package com.project.Band_Up.dtos.blog;

import com.project.Band_Up.dtos.comment.BlogCommentResponse;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BlogPostDetails {
    private UUID id;
    private String title;
    private String titleImg;
    private String content;
    private List<TagDto> tags;
    private List<BlogCommentResponse> comments;
    private List<ReactDto> reacts;
    private long numberOfReaders;
    private long numberOfComments;
    private long numberOfReacts;
}
