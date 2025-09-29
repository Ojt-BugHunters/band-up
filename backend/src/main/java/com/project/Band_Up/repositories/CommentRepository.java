package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    // List all comments by test ID ordered by creation date descending
    List<Comment> findAllByTest_IdOrderByCreateAtDesc(UUID testId);
    // Count comments by test ID
    Integer countByTest_Id(UUID testId);
}
