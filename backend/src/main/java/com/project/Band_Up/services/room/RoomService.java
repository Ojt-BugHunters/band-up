package com.project.Band_Up.services.room;

import com.project.Band_Up.dtos.room.RoomCreateRequest;
import com.project.Band_Up.dtos.room.RoomResponse;
import com.project.Band_Up.entities.Room;

import java.util.UUID;

public interface RoomService {
    RoomResponse createRoom(UUID creatorId, RoomCreateRequest roomRequest);

    RoomResponse getRoomById(UUID roomId);

    RoomResponse addMemberToRoom(UUID roomId, UUID userId);

    void removeMemberFromRoom(UUID roomId, UUID userId);

    RoomResponse updateRoom(UUID roomId, RoomCreateRequest updateRequest);

    void deleteRoom(UUID roomId);
}
