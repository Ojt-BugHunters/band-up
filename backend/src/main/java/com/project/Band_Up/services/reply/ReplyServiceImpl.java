package com.project.Band_Up.services.reply;

import com.project.Band_Up.dtos.reply.ReplyCreateRequest;
import com.project.Band_Up.dtos.reply.ReplyResponse;
import com.project.Band_Up.dtos.reply.ReplyUpdateRequest;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Comment;
import com.project.Band_Up.entities.Reply;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.CommentRepository;
import com.project.Band_Up.repositories.ReplyRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReplyServiceImpl implements ReplyService {
    private final ReplyRepository replyRepository;
    private final AccountRepository accountRepository;
    private final CommentRepository commentRepository;
    private final ModelMapper modelMapper;

    @Override
    public ReplyResponse createReplyForComment(UUID userId, UUID commentId, ReplyCreateRequest request) {
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        Reply reply = modelMapper.map(request, Reply.class);
        reply.setUser(user);
        reply.setComment(comment);

        Reply saved = replyRepository.save(reply);
        return toResponse(saved);
    }

    @Override
    public List<ReplyResponse> getAllRepliesByCommentId(UUID commentId) {
        return replyRepository.findAllByComment_IdOrderByCreateAtDesc(commentId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ReplyResponse updateReply(UUID replyId, UUID userId, ReplyUpdateRequest request) {
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));

        if (!reply.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this reply");
        }

        reply.setContent(request.getContent());
        Reply updated = replyRepository.save(reply);

        return toResponse(updated);
    }

    @Override
    public void deleteReply(UUID replyId, UUID userId) {
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));

        if (!reply.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this reply");
        }

        replyRepository.delete(reply);
    }
    private ReplyResponse toResponse(Reply reply) {
        ReplyResponse replyResponse = modelMapper.map(reply, ReplyResponse.class);
        replyResponse.setUserId(reply.getUser().getId());
        replyResponse.setCommentId(reply.getComment().getId());
        return replyResponse;
    }
}
