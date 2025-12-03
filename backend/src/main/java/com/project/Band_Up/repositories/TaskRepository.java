package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByAccount_Id(UUID accountId);

    List<Task> findByAccount_IdAndCompletedFalse(UUID accountId);

    List<Task> findByAccount_IdAndCompletedTrue(UUID accountId);

    List<Task> findByAccount_IdAndCreateAtBetween(UUID accountId, LocalDateTime start, LocalDateTime end);


    @Query("SELECT t FROM Task t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Task> searchByTitle(String keyword);

    @Query("""
    SELECT COUNT(t) FROM Task t
    WHERE t.account.id = :accountId
      AND t.completed = true
      AND t.createAt >= :start
      AND t.createAt < :end
""")
    Integer countCompletedTasksInDay(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("accountId") UUID accountId

    );
}
