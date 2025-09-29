package com.project.Band_Up.services.comment;

import com.project.Band_Up.dtos.comment.CommentCreateRequest;
import com.project.Band_Up.dtos.comment.CommentResponse;
import com.project.Band_Up.dtos.comment.CommentUpdateRequest;

import java.util.List;
import java.util.UUID;

public interface CommentService {
    // Create Comment
    CommentResponse createComment(UUID userId, UUID testId, CommentCreateRequest commentCreateRequest);
    // Get all Comments by TestId ordered by createdAt desc
    List<CommentResponse> getAllCommentsByTestId(UUID testId);
    // Update Comment
    CommentResponse updateComment(UUID commentId, UUID userId, CommentUpdateRequest commentUpdateRequest);
    // Delete Comment
    void deleteComment(UUID commentId, UUID userId);
    // Count Comments by TestId
    Integer countCommentsByTestId(UUID testId);
}
