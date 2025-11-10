package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Room;
import com.project.Band_Up.entities.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
    Optional<Room> findRoomByUserId(UUID userId);
}
