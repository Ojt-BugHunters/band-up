package com.project.Band_Up.services.comment;

import com.project.Band_Up.dtos.comment.*;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.BlogPost;
import com.project.Band_Up.entities.Comment;
import com.project.Band_Up.entities.Test;
import com.project.Band_Up.exceptions.ResourceNotFoundException;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.BlogRepository;
import com.project.Band_Up.repositories.CommentRepository;
import com.project.Band_Up.repositories.TestRepository;
import com.project.Band_Up.services.AwsService.S3Service;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final AccountRepository accountRepository;
    private final TestRepository testRepository;
    private final ModelMapper modelMapper;
    private final BlogRepository blogRepository;
    private final S3Service s3Service;

    @Override
    public CommentResponse createComment(UUID userId, UUID testId, CommentCreateRequest request) {
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        Comment comment = modelMapper.map(request, Comment.class);
        comment.setUser(user);
        comment.setTest(test);

        Comment saved = commentRepository.save(comment);
        return modelMapper.map(saved, CommentResponse.class);
    }
//test git
    //tágdkajshfgvcakshufdgclajksgdjlk
    @Override
    public     List<CommentResponse> getAllCommentsByTestId(UUID testId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        List<Comment> comments = commentRepository.findAllByTest_IdOrderByCreateAtDesc(testId);
        return comments.stream()
                .map(c -> modelMapper.map(c, CommentResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    public CommentResponse updateComment(UUID commentId, UUID userId, CommentUpdateRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not the owner of this comment");
        }

        modelMapper.map(request, comment); // map fields từ request vào comment
        Comment updated = commentRepository.save(comment);

        return modelMapper.map(updated, CommentResponse.class);
    }

    @Override
    public void deleteComment(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not the owner of this comment");
        }

        if(comment.getBlogPost() != null) {
            BlogPost blogPost = comment.getBlogPost();
            blogPost.getComments().remove(comment);
            comment.setBlogPost(null);
            blogRepository.save(blogPost);
            return;
        }
        commentRepository.delete(comment);
    }
    @Override
    public Integer countCommentsByTestId(UUID testId) {
        return commentRepository.countByTest_Id(testId);
    }

    @Override
    public BlogCommentResponse createBlogComment(UUID userId, UUID blogId, CommentCreateRequest commentCreateRequest) {
        BlogPost blogPost =  blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));
        Account account =  accountRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        Comment comment = modelMapper.map(commentCreateRequest, Comment.class);
        comment.setUser(account);
        comment.setBlogPost(blogPost);
        Comment saved = commentRepository.save(comment);
        blogPost.getComments().add(comment);
        blogRepository.save(blogPost);
        BlogCommentResponse commentResponse = modelMapper.map(saved, BlogCommentResponse.class);
        commentResponse.setBlogId(blogId);
        CommentAuthor commentAuthor = CommentAuthor.builder()
                .id(account.getId())
                .name(account.getName())
                .avatar(account.getAvatarKey() != null ? s3Service.createCloudFrontSignedUrl(account.getAvatarKey()) : null)
                .build();
        commentResponse.setAuthor(commentAuthor);
        return commentResponse;
    }
}
