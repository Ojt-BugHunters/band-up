package com.project.Band_Up.repositories;

import com.project.Band_Up.entities.RoomChat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RoomChatRepository extends JpaRepository<RoomChat, UUID> {
}
