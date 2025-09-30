package com.project.Band_Up.services.reply;

import com.project.Band_Up.dtos.reply.ReplyCreateRequest;
import com.project.Band_Up.dtos.reply.ReplyResponse;
import com.project.Band_Up.dtos.reply.ReplyUpdateRequest;

import java.util.List;
import java.util.UUID;

public interface ReplyService {
    // tạo reply
    ReplyResponse createReplyForComment(UUID userId, UUID commentId, ReplyCreateRequest request);
    // lấy tất cả reply theo commentId
    List<ReplyResponse> getAllRepliesByCommentId(UUID commentId);
    // cập nhật reply
    ReplyResponse updateReply(UUID replyId, UUID userId, ReplyUpdateRequest request);
    // xóa reply
    void deleteReply(UUID replyId, UUID userId);
}

