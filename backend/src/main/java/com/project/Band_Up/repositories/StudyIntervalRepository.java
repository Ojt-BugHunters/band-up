package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.StudyInterval;
import com.project.Band_Up.entities.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@Repository
public interface StudyIntervalRepository extends JpaRepository<StudyInterval, UUID> {
    List<StudyInterval> findByStudySessionOrderByOrderIndexAsc(StudySession studySession);

    @Query("SELECT si FROM StudyInterval si " +
            "JOIN si.studySession ss " +
            "WHERE ss.user.id = :userId " +
            "  AND si.startAt < :rangeEnd " +
            "  AND si.endedAt > :rangeStart")
    List<StudyInterval> findByUserAndOverlapRange(
            @Param("userId") UUID userId,
            @Param("rangeStart") LocalDateTime rangeStart,
            @Param("rangeEnd") LocalDateTime rangeEnd);
}
