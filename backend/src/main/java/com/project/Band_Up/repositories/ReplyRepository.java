package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Reply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface ReplyRepository extends JpaRepository<Reply, UUID> {
    //lấy tất cả reply theo commentId sắp xếp theo createAt mới nhất
    List<Reply> findAllByComment_IdOrderByCreateAtDesc(UUID commentId);
    //xóa tất cả reply theo commentId
    void deleteAllByComment_Id(UUID commentId);
    //đếm số lượng reply theo commentId
    Integer countByComment_Id(UUID commentId);
}
