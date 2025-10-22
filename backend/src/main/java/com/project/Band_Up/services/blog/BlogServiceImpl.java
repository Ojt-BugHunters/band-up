package com.project.Band_Up.services.blog;

import com.project.Band_Up.dtos.blog.BlogAuthor;
import com.project.Band_Up.dtos.blog.BlogPostDetails;
import com.project.Band_Up.dtos.blog.BlogPosts;
import com.project.Band_Up.dtos.blog.BlogRequest;
import com.project.Band_Up.entities.*;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.*;
import com.project.Band_Up.services.AwsService.S3Service;
import com.project.Band_Up.services.AwsService.S3ServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class BlogServiceImpl implements BlogService {

    @Autowired
    private BlogRepository blogRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private ReplyRepository replyRepository;
    @Autowired
    private S3Service s3Service;
    @Autowired
    private TagRepository tagRepository;

    @Override
    public BlogPosts createBlogPost(BlogRequest blogRequest, UUID accountId) {
        BlogPost blogPost = modelMapper.map(blogRequest, BlogPost.class);
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        blogPost.setAuthor(account);
        blogPost.setNumberOfReader(0);
        return modelMapper.map(blogRepository.save(blogPost), BlogPosts.class);
    }

    @Override
    public BlogPostDetails getBlogPostDetails(UUID blogPostId) {
        BlogPost blogPost = blogRepository.findById(blogPostId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));
        BlogPostDetails blogPostDetails = modelMapper.map(blogPost, BlogPostDetails.class);
        int totalComment = blogPost.getComments().size();
        int totalReplies = 0;
        for (Comment comment : blogPost.getComments()) {
            for (Reply reply : comment.getReplies()) {
                totalReplies++;
            }
        }
        blogPostDetails.setTitleImg(s3Service.createCloudFrontSignedUrl(blogPost.getTitleImg()));
        blogPostDetails.setNumberOfComments(totalComment+totalReplies);
        return blogPostDetails;
    }

    @Override
    public void addNumberOfReader(UUID blogPostId) {
        BlogPost blogPost = blogRepository.findById(blogPostId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));
        blogPost.setNumberOfReader(blogPost.getNumberOfReader()+1);
        blogRepository.save(blogPost);
    }

    @Override
    public Page<BlogPosts> getBlogPosts(Integer pageNo, Integer pageSize,
                                        String queryBy, Boolean ascending,
                                        UUID tagId) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, ascending ? Sort.by("numberOfReader").ascending() : Sort.by("numberOfReader").descending());

        Page<BlogPost> blogPostPage;

        if (tagId != null) {
            Tag tag = tagRepository.findById(tagId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));

            if(queryBy != null && !queryBy.isEmpty()){
                blogPostPage = blogRepository.findByTitleContainingIgnoreCaseAndTags(queryBy, List.of(tag), pageable);
            } else {
                blogPostPage = blogRepository.findByTags(List.of(tag), pageable);
            }
        } else {
            if(queryBy != null && !queryBy.isEmpty()){
                blogPostPage = blogRepository.findByTitleContainingIgnoreCase(queryBy, pageable);
            } else {
                blogPostPage = blogRepository.findAll(pageable);
            }
        }

        return blogPostPage.map(blogPost -> {
            BlogPosts posts = modelMapper.map(blogPost, BlogPosts.class);

            posts.setTitleImg(s3Service.createCloudFrontSignedUrl(blogPost.getTitleImg()));

            if (blogPost.getAuthor() != null) {
                BlogAuthor author = BlogAuthor.builder()
                        .id(blogPost.getAuthor().getId())
                        .name(blogPost.getAuthor().getName())
                        .avatar(blogPost.getAuthor().getAvatarKey() != null ?
                                s3Service.createCloudFrontSignedUrl(blogPost.getAuthor().getAvatarKey()) : null)
                        .build();
                posts.setAuthor(author);
            }

            int totalComments = blogPost.getComments().size();
            int totalReplies = 0;
            for (Comment comment : blogPost.getComments()) {
                totalReplies += comment.getReplies().size();
            }
            posts.setNumberOfComments(totalComments + totalReplies);

            return posts;
        });
    }

    @Override
    public List<BlogPosts> getFeaturedBlogPosts() {
        Pageable pageable = PageRequest.of(0, 5, Sort.by("numberOfReader").descending());
        Page<BlogPost> blogPostPage = blogRepository.findAll(pageable);

        return blogPostPage.map(blogPost -> {
            BlogPosts posts = modelMapper.map(blogPost, BlogPosts.class);

            posts.setTitleImg(s3Service.createCloudFrontSignedUrl(blogPost.getTitleImg()));

            if (blogPost.getAuthor() != null) {
                BlogAuthor author = BlogAuthor.builder()
                        .id(blogPost.getAuthor().getId())
                        .name(blogPost.getAuthor().getName())
                        .avatar(blogPost.getAuthor().getAvatarKey() != null ?
                                s3Service.createCloudFrontSignedUrl(blogPost.getAuthor().getAvatarKey()) : null)
                        .build();
                posts.setAuthor(author);
            }

            int totalComments = blogPost.getComments().size();
            int totalReplies = 0;
            for (Comment comment : blogPost.getComments()) {
                totalReplies += comment.getReplies().size();
            }
            posts.setNumberOfComments(totalComments + totalReplies);

            return posts;
        }).getContent();
    }

}
