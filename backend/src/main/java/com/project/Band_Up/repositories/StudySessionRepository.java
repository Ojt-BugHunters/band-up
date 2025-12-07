package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Room;
import com.project.Band_Up.entities.StudySession;
import com.project.Band_Up.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, UUID> {
    List<StudySession> findAllByRoom_IdAndUser_Id(UUID roomId, UUID userId);
    @Modifying
    @Query("UPDATE StudySession s SET s.room = null WHERE s.room.id = :roomId AND s.user.id = :userId")
    void clearRoomReferenceByRoomAndUser(@Param("roomId") UUID roomId, @Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE StudySession s SET s.room = null WHERE s.room = :room")
    void clearRoomReferenceByRoom(@Param("room") Room room);

    @Query("""
    SELECT s FROM StudySession s
    WHERE s.createAt BETWEEN :start AND :end
      AND s.user.id = :userId
""")
    List<StudySession> findSessionsInRange(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("userId") UUID userId
    );

    @Query("""
    SELECT COUNT(s) FROM StudySession s
    WHERE s.createAt >= :start
      AND s.createAt < :end
      AND s.user.id = :userId
""")
    Integer countSessionsInRange(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("userId") UUID userId
    );



    List<StudySession> findByStatusAndUser_Id(Status status, UUID userId);

    Optional<StudySession> findByUser_IdAndStatus(UUID userId, Status status);

    @Query("""
        SELECT s.room.id, AVG(s.totalFocusTime)
        FROM StudySession s
        WHERE s.room.id IS NOT NULL
          AND s.totalFocusTime IS NOT NULL
        GROUP BY s.room.id
    """)
    List<Object[]> findAverageFocusTimeByRoom();

    @Query("""
        SELECT s.user.id, s.user.name, s.user.avatarKey, SUM(s.totalFocusTime)
        FROM StudySession s
        WHERE s.totalFocusTime IS NOT NULL
          AND s.createAt >= :start
          AND s.createAt < :end
        GROUP BY s.user.id, s.user.name, s.user.avatarKey
        ORDER BY SUM(s.totalFocusTime) DESC
    """)
    List<Object[]> findTop10UsersByTotalStudyTime(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

}
