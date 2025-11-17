package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Room;
import com.project.Band_Up.entities.StudySession;
import com.project.Band_Up.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

    List<StudySession> findByStatusAndUser_Id(Status status, UUID userId);
}
