package com.project.Band_Up.services.blog;

import com.project.Band_Up.dtos.blog.BlogPostDetails;
import com.project.Band_Up.dtos.blog.BlogPosts;
import com.project.Band_Up.dtos.blog.BlogRequest;
import com.project.Band_Up.dtos.blog.TagDto;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface BlogService {

    public BlogPosts createBlogPost(BlogRequest blogRequest, UUID accountId);
    public BlogPostDetails getBlogPostDetails(UUID blogPostId);
    public void addNumberOfReader(UUID blogPostId);
    public Page<BlogPosts> getBlogPosts(Integer pageNo, Integer pageSize,
                                        String queryBy, Boolean ascending,
                                        UUID tagId);
    public List<BlogPosts> getFeaturedBlogPosts();
    public List<TagDto> getAllTags();
}
