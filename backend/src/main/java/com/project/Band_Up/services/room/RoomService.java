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
    void deleteRoom(UUID roomId);

    // Thành viên
    RoomResponse addMemberToRoom(UUID roomId, UUID userId);
    void removeMemberFromRoom(UUID roomId, UUID userId);
    RoomResponse leaveRoom(UUID roomId, UUID userId);

    // Tiện ích
    List<RoomResponse> getAllPublicRooms();  // isPrivate = false
    RoomResponse getRoomByCode(String roomCode);
    boolean isMember(UUID roomId, UUID userId);

    // (Tuỳ chọn)
    void transferHost(UUID roomId, UUID newHostId);
}
