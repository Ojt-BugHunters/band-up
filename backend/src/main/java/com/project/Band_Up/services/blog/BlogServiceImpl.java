package com.project.Band_Up.services.blog;

import com.project.Band_Up.dtos.blog.BlogPostDetails;
import com.project.Band_Up.dtos.blog.BlogPosts;
import com.project.Band_Up.dtos.blog.BlogRequest;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.BlogPost;
import com.project.Band_Up.entities.Comment;
import com.project.Band_Up.entities.Reply;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.BlogRepository;
import com.project.Band_Up.repositories.CommentRepository;
import com.project.Band_Up.repositories.ReplyRepository;
import com.project.Band_Up.services.AwsService.S3Service;
import com.project.Band_Up.services.AwsService.S3ServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
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


}
