package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.Room;
import com.project.Band_Up.entities.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoomMemberRepository extends JpaRepository<RoomMember, UUID> {
    int countByRoom(Room room);

    List<RoomMember> findByRoom(Room room);
}
