package com.project.Band_Up.services.room;

import com.project.Band_Up.dtos.room.RoomCreateRequest;
import com.project.Band_Up.entities.Room;

import java.util.UUID;

public interface RoomService {
    Room createRoom(UUID creatorId, RoomCreateRequest roomRequest);
}
