package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.blog.BlogPostDetails;
import com.project.Band_Up.dtos.blog.BlogPosts;
import com.project.Band_Up.dtos.blog.BlogRequest;
import com.project.Band_Up.dtos.blog.ReactDto;
import com.project.Band_Up.dtos.blog.TagDto;
import com.project.Band_Up.services.blog.BlogService;
import com.project.Band_Up.utils.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/blog")
@Tag(name = "Blog API", description = "Endpoints for managing blog posts (create, read, update, delete)")
public class BlogController {

    @Autowired
    private BlogService blogService;

    @PostMapping("/create")
    @Operation(
            summary = "Create a new blog post",
            description = "Creates a new blog post with title, content, title image, and tags. Requires authentication."
    )
    public ResponseEntity<BlogPosts> createBlogPost(
            @RequestBody BlogRequest blogRequest,
            @AuthenticationPrincipal JwtUserDetails userDetails) {
        BlogPosts createdPost = blogService.createBlogPost(blogRequest, userDetails.getAccountId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    @GetMapping("/{blogPostId}")
    @Operation(
            summary = "Get blog post details by ID",
            description = "Retrieves detailed information about a specific blog post including title, content, author, tags, comments, and reactions"
    )
    public ResponseEntity<BlogPostDetails> getBlogPostDetails(
            @Parameter(description = "ID of the blog post to retrieve")
            @PathVariable UUID blogPostId) {
        BlogPostDetails blogPostDetails = blogService.getBlogPostDetails(blogPostId);
        return ResponseEntity.ok(blogPostDetails);
    }

    @PostMapping("/{blogPostId}/read")
    @Operation(
            summary = "Increment blog post reader count",
            description = "Increases the number of readers for a specific blog post by 1"
    )
    public ResponseEntity<Void> addNumberOfReader(
            @Parameter(description = "ID of the blog post")
            @PathVariable UUID blogPostId) {
        blogService.addNumberOfReader(blogPostId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    @Operation(
            summary = "Search and filter blog posts",
            description = "Retrieves a paginated list of blog posts filtered by optional tag and search query, sorted by number of readers"
    )
    public ResponseEntity<Page<BlogPosts>> getBlogPosts(
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") Integer pageNo,
            @Parameter(description = "Number of items per page")
            @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "Search query to filter by title (optional)")
            @RequestParam(required = false) String queryBy,
            @Parameter(description = "Sort order: true for ascending, false for descending")
            @RequestParam(defaultValue = "false") Boolean ascending,
            @Parameter(description = "Tag ID to filter blog posts (optional)")
            @RequestParam(required = false) UUID tagId) {
        Page<BlogPosts> blogPosts = blogService.getBlogPosts(pageNo, pageSize, queryBy, ascending, tagId);
        return ResponseEntity.ok(blogPosts);
    }

    @GetMapping("/featured")
    @Operation(
            summary = "Get featured blog posts",
            description = "Retrieves the top 5 blog posts with the highest number of readers"
    )
    public ResponseEntity<List<BlogPosts>> getFeaturedBlogPosts() {
        List<BlogPosts> featuredPosts = blogService.getFeaturedBlogPosts();
        return ResponseEntity.ok(featuredPosts);
    }

    @GetMapping("/tags")
    @Operation(
            summary = "Get all tags",
            description = "Retrieves all available tags for blog posts"
    )
    public ResponseEntity<List<TagDto>> getAllTags() {
        List<TagDto> tags = blogService.getAllTags();
        return ResponseEntity.ok(tags);
    }

    @PostMapping("/{blogPostId}/react")
    @Operation(
            summary = "React or unreact to a blog post",
            description = "Adds a reaction (Like, Love, Sad, Angry, Haha, Wow) to a blog post. If the same reaction type is sent again, it removes the reaction. If a different reaction type is sent, it updates to the new reaction type. Requires authentication."
    )
    public ResponseEntity<ReactDto> reactToBlogPost(
            @Parameter(description = "ID of the blog post to react to")
            @PathVariable UUID blogPostId,
            @RequestBody ReactDto reactDto,
            @AuthenticationPrincipal JwtUserDetails userDetails) {
        ReactDto result = blogService.reactToBlogPost(userDetails.getAccountId(), blogPostId, reactDto);
        if (result == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }
}
