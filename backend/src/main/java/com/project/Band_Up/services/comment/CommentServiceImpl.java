package com.project.Band_Up.services.comment;

import com.project.Band_Up.dtos.comment.CommentCreateRequest;
import com.project.Band_Up.dtos.comment.CommentResponse;
import com.project.Band_Up.dtos.comment.CommentUpdateRequest;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Comment;
import com.project.Band_Up.entities.Test;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.CommentRepository;
import com.project.Band_Up.repositories.TestRepository;
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

    @Override
    public List<CommentResponse> getAllCommentsByTestId(UUID testId) {
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

        commentRepository.delete(comment);
    }
}
