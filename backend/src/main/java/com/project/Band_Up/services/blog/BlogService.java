package com.project.Band_Up.services.blog;

import com.project.Band_Up.dtos.blog.BlogPostDetails;
import com.project.Band_Up.dtos.blog.BlogPosts;
import com.project.Band_Up.dtos.blog.BlogRequest;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface BlogService {

    public BlogPosts createBlogPost(BlogRequest blogRequest, UUID accountId);
    public BlogPostDetails getBlogPostDetails(UUID blogPostId);
}
