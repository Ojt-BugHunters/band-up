package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.RoomChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

public interface RoomChatRepository extends JpaRepository<RoomChat, UUID> {
    @Modifying
    @Transactional
    @Query("DELETE FROM RoomChat rc WHERE rc.room.id = :roomId")
    void deleteAllByRoomId(@Param("roomId") UUID roomId);
}
