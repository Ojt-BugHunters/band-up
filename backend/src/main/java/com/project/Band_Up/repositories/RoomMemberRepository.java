package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Room;
import com.project.Band_Up.entities.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomMemberRepository extends JpaRepository<RoomMember, UUID> {
    int countByRoom(Room room);

    List<RoomMember> findByRoom(Room room);

    Optional<RoomMember> findByRoomAndUser(Room room, Account user);
    @Query("""
        SELECT rm.room FROM RoomMember rm
        WHERE rm.user.id = :userId
    """)
    List<Room> findRoomByUserId(UUID userId);
    void deleteAllByRoom(Room room);


    boolean existsByUser_IdAndIsActiveTrue(UUID userId);

    long countByIsActiveTrue();

    long countByJoinedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("""
        SELECT rm.room.id, COUNT(rm.id) 
        FROM RoomMember rm 
        WHERE rm.isActive = true
        GROUP BY rm.room.id 
        ORDER BY COUNT(rm.id) DESC
    """)
    List<Object[]> findTopRoomsByActiveMemberCount();
}
