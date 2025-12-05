package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.RoomStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface RoomStatRepository extends JpaRepository<RoomStat, UUID> {
    @Query("SELECT r FROM RoomStat r WHERE r.recordedAt <= :targetDate ORDER BY r.recordedAt DESC LIMIT 1")
    Optional<RoomStat> findTopByRecordedAtBeforeOrderByRecordedAtDesc(@Param("targetDate") LocalDateTime targetDate);
}

