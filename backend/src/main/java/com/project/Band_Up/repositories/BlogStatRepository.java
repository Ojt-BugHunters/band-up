package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.BlogStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface BlogStatRepository extends JpaRepository<BlogStat, UUID> {
    @Query("SELECT b FROM BlogStat b WHERE b.recordedAt <= :targetDate ORDER BY b.recordedAt DESC LIMIT 1")
    Optional<BlogStat> findTopByRecordedAtBeforeOrderByRecordedAtDesc(@Param("targetDate") LocalDateTime targetDate);
}

