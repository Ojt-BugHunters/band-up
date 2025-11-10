package com.project.Band_Up.services.room;

import com.project.Band_Up.dtos.room.RoomCreateRequest;
import com.project.Band_Up.dtos.room.RoomResponse;
import com.project.Band_Up.entities.Room;

import java.util.List;
import java.util.UUID;

public interface RoomService {
    // CRUD cơ bản
    RoomResponse createRoom(UUID creatorId, RoomCreateRequest roomRequest);
    RoomResponse getRoomById(UUID roomId);
    RoomResponse updateRoom(UUID roomId, RoomCreateRequest updateRequest);
    void deleteRoom(UUID actorId, UUID roomId);

    // Thành viên
    RoomResponse addMemberToRoom(UUID roomId, UUID userId);
    void removeMemberFromRoom(UUID actorId, UUID roomId, UUID targetUserId);
    RoomResponse leaveRoom(UUID roomId, UUID userId);

    // Tiện ích
    List<RoomResponse> getAllPublicRooms();
    RoomResponse getRoomByCode(String roomCode);
    boolean isMember(UUID roomId, UUID userId);
    void transferHost(UUID actorId, UUID roomId, UUID newHostId);
    RoomResponse isUserInRoom(UUID userId);
}

