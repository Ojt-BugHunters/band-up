package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.QuizletStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface QuizletStatRepository extends JpaRepository<QuizletStat, UUID> {
    @Query("SELECT q FROM QuizletStat q WHERE q.recordedAt <= :targetDate ORDER BY q.recordedAt DESC LIMIT 1")
    Optional<QuizletStat> findTopByRecordedAtBeforeOrderByRecordedAtDesc(@Param("targetDate") LocalDateTime targetDate);
}
