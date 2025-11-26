package com.project.Band_Up.services.room;

import com.project.Band_Up.dtos.room.RoomCreateRequest;
import com.project.Band_Up.dtos.room.RoomEvent;
import com.project.Band_Up.dtos.room.RoomResponse;
import com.project.Band_Up.dtos.roomMember.RoomMemberResponse;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Room;
import com.project.Band_Up.entities.RoomMember;
import com.project.Band_Up.enums.Role;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.RoomMemberRepository;
import com.project.Band_Up.repositories.RoomRepository;
import com.project.Band_Up.repositories.StudySessionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final AccountRepository accountRepository;
    private final ModelMapper modelMapper;
    private final StudySessionRepository studySessionRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ================== ROOM CRUD + MEMBER =====================

    @Override
    public RoomResponse createRoom(UUID creatorId, RoomCreateRequest request) {
        Account creator = accountRepository.findById(creatorId)
                .orElseThrow(() -> new EntityNotFoundException("Creator not found"));

        Room room = modelMapper.map(request, Room.class);
        room.setCreatorId(creator.getId());
        if (room.getPrivateRoom() == null) room.setPrivateRoom(true);
        room.setRoomCode(generateRoomCode(room.getRoomName()));

        Room savedRoom = roomRepository.save(room);

        RoomMember creatorMember = new RoomMember();
        creatorMember.setUser(creator);
        creatorMember.setRoom(savedRoom);
        creatorMember.setRole(Role.Host);
        creatorMember.setJoinedAt(LocalDateTime.now());
        creatorMember.setIsActive(true);
        roomMemberRepository.save(creatorMember);

        RoomResponse response = buildRoomResponse(savedRoom);

        if (Boolean.FALSE.equals(savedRoom.getPrivateRoom())) {
            publishPublicRoomEvent("ROOM_CREATED", response);
        }

        publishRoomEvent(savedRoom.getId(), "MEMBER_JOINED",
                RoomMemberResponse.builder()
                        .id(creatorMember.getId())
                        .roomId(savedRoom.getId())
                        .userId(creator.getId())
                        .role(creatorMember.getRole().name())
                        .joinedAt(creatorMember.getJoinedAt())
                        .build()
        );

        return response;
    }

    private String generateRoomCode(String name) {
        String prefix = name.toLowerCase()
                .replaceAll("[^a-z0-9]", "-")
                .replaceAll("-+", "-");
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        return prefix + "-" + randomSuffix;
    }

    @Override
    public RoomResponse getRoomByCode(String roomCode) {
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));
        return buildRoomResponse(room);
    }

    @Override
    public List<RoomResponse> getAllPublicRooms() {
        return roomRepository.findByPrivateRoomFalse().stream()
                .map(this::buildRoomResponse)
                .collect(Collectors.toList());
    }

    @Override
    public boolean isMember(UUID roomId, UUID userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return roomMemberRepository.findByRoomAndUser(room, user).isPresent();
    }

    @Override
    public void transferHost(UUID actorId, UUID roomId, UUID newHostId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));

        Account actor = accountRepository.findById(actorId)
                .orElseThrow(() -> new EntityNotFoundException("Actor not found"));
        Account newHost = accountRepository.findById(newHostId)
                .orElseThrow(() -> new EntityNotFoundException("New host not found"));

        RoomMember actorMember = roomMemberRepository.findByRoomAndUser(room, actor)
                .orElseThrow(() -> new EntityNotFoundException("Actor not in this room"));
        RoomMember newHostMember = roomMemberRepository.findByRoomAndUser(room, newHost)
                .orElseThrow(() -> new EntityNotFoundException("New host not in this room"));

        if (actorMember.getRole() != Role.Host) {
            throw new IllegalStateException("Only host can transfer host role");
        }

        if (actorId.equals(newHostId)) {
            throw new IllegalStateException("Cannot transfer host role to yourself");
        }

        actorMember.setRole(Role.Guest);
        newHostMember.setRole(Role.Host);

        roomMemberRepository.save(actorMember);
        roomMemberRepository.save(newHostMember);

        publishRoomEvent(roomId, "HOST_CHANGED",
                Map.of("oldHostId", actorId, "newHostId", newHostId));

        publishRoomUpdated(room);
    }

    @Override
    public RoomResponse getRoomById(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));
        return buildRoomResponse(room);
    }

    @Override
    public RoomResponse addMemberToRoom(UUID roomId, UUID userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        boolean alreadyJoined = roomMemberRepository.findByRoom(room).stream()
                .anyMatch(member -> member.getUser().getId().equals(userId));
        if (alreadyJoined)
            throw new IllegalStateException("User already in this room");

        RoomMember newMember = new RoomMember();
        newMember.setRoom(room);
        newMember.setUser(user);
        newMember.setRole(Role.Guest);
        newMember.setJoinedAt(LocalDateTime.now());
        newMember.setIsActive(true);
        roomMemberRepository.save(newMember);

        RoomResponse response = buildRoomResponse(room);

        publishRoomEvent(roomId, "MEMBER_JOINED",
                RoomMemberResponse.builder()
                        .id(newMember.getId())
                        .roomId(room.getId())
                        .userId(user.getId())
                        .role(newMember.getRole().name())
                        .joinedAt(newMember.getJoinedAt())
                        .build()
        );

        publishRoomUpdated(room);

        return response;
    }

    @Override
    public void removeMemberFromRoom(UUID actorId, UUID roomId, UUID targetUserId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));

        Account actor = accountRepository.findById(actorId)
                .orElseThrow(() -> new EntityNotFoundException("Actor not found"));
        Account target = accountRepository.findById(targetUserId)
                .orElseThrow(() -> new EntityNotFoundException("Target user not found"));

        RoomMember actorMember = roomMemberRepository.findByRoomAndUser(room, actor)
                .orElseThrow(() -> new EntityNotFoundException("Actor not in this room"));
        RoomMember targetMember = roomMemberRepository.findByRoomAndUser(room, target)
                .orElseThrow(() -> new EntityNotFoundException("User not in this room"));

        if (actorMember.getRole() != Role.Host) {
            throw new IllegalStateException("Only host can remove members");
        }

        if (actorId.equals(targetUserId)) {
            throw new IllegalStateException("Host cannot remove themselves. Use leaveRoom instead.");
        }

        studySessionRepository.clearRoomReferenceByRoomAndUser(room.getId(), targetUserId);
        roomMemberRepository.delete(targetMember);

        publishRoomEvent(roomId, "MEMBER_KICKED",
                Map.of("userId", targetUserId));

        publishRoomUpdated(room);
    }

    @Override
    public RoomResponse updateRoom(UUID roomId, RoomCreateRequest updateRequest) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));

        room.setRoomName(updateRequest.getRoomName());
        room.setDescription(updateRequest.getDescription());
        room.setPrivateRoom(updateRequest.getPrivateRoom());
        Room updated = roomRepository.save(room);

        RoomResponse response = buildRoomResponse(updated);

        publishRoomUpdated(updated);

        if (Boolean.FALSE.equals(updated.getPrivateRoom())) {
            publishPublicRoomEvent("ROOM_UPDATED", response);
        }

        return response;
    }

    @Override
    public void deleteRoom(UUID actorId, UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));

        Account actor = accountRepository.findById(actorId)
                .orElseThrow(() -> new EntityNotFoundException("Actor not found"));

        RoomMember actorMember = roomMemberRepository.findByRoomAndUser(room, actor)
                .orElseThrow(() -> new EntityNotFoundException("Actor not in this room"));

        if (actorMember.getRole() != Role.Host) {
            throw new IllegalStateException("Only host can delete the room");
        }
        if (roomMemberRepository.countByRoom(room) > 1) {
            throw new IllegalStateException("Cannot delete room while members still inside");
        }

        studySessionRepository.clearRoomReferenceByRoom(room);
        roomMemberRepository.deleteAllByRoom(room);
        roomRepository.delete(room);

        publishRoomEvent(roomId, "ROOM_DELETED",
                Map.of("reason", "HOST_DELETED"));

        publishPublicRoomEvent("ROOM_DELETED",
                RoomResponse.builder()
                        .Id(roomId)
                        .roomName(room.getRoomName())
                        .roomCode(room.getRoomCode())
                        .build()
        );
    }

    @Override
    public RoomResponse leaveRoom(UUID roomId, UUID userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));
        studySessionRepository.clearRoomReferenceByRoomAndUser(roomId, userId);

        List<RoomMember> members = roomMemberRepository.findByRoom(room);
        RoomMember leaver = members.stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("User not in this room"));

        roomMemberRepository.delete(leaver);

        List<RoomMember> remaining = roomMemberRepository.findByRoom(room);

        publishRoomEvent(roomId, "MEMBER_LEFT",
                Map.of("userId", userId));

        if (remaining.isEmpty()) {
            roomRepository.delete(room);

            publishRoomEvent(roomId, "ROOM_DELETED",
                    Map.of("reason", "NO_MEMBER_LEFT"));

            publishPublicRoomEvent("ROOM_DELETED",
                    RoomResponse.builder()
                            .Id(roomId)
                            .roomName(room.getRoomName())
                            .roomCode(room.getRoomCode())
                            .build()
            );

            return null;
        }

        if (leaver.getRole() == Role.Host) {
            RoomMember earliest = remaining.stream()
                    .min(Comparator.comparing(RoomMember::getJoinedAt))
                    .orElseThrow(() -> new EntityNotFoundException("No members left"));
            earliest.setRole(Role.Host);
            roomMemberRepository.save(earliest);

            publishRoomEvent(roomId, "HOST_CHANGED",
                    Map.of("newHostId", earliest.getUser().getId()));
        }

        publishRoomUpdated(room);
        return buildRoomResponse(room);
    }

    @Override
    public List<RoomResponse> isUserInRoom(UUID userId) {
        List<Room> rooms = roomMemberRepository.findRoomByUserId(userId);
        return rooms.stream()
                .map(this::buildRoomResponse)
                .collect(Collectors.toList());
    }

    // ================== HELPER =====================

    private RoomResponse buildRoomResponse(Room room) {
        List<RoomMember> members = roomMemberRepository.findByRoom(room);
        List<RoomMemberResponse> memberResponses = members.stream()
                .map(m -> RoomMemberResponse.builder()
                        .id(m.getId())
                        .roomId(room.getId())
                        .userId(m.getUser().getId())
                        .role(m.getRole().name())
                        .joinedAt(m.getJoinedAt())
                        .build())
                .collect(Collectors.toList());

        return RoomResponse.builder()
                .Id(room.getId())
                .roomName(room.getRoomName())
                .description(room.getDescription())
                .roomCode(room.getRoomCode())
                .privateRoom(room.getPrivateRoom())
                .createdBy(room.getCreatorId())
                .numberOfMembers(roomMemberRepository.countByRoom(room))
                .members(memberResponses)
                .createdAt(room.getCreateAt())
                .build();
    }

    private void publishRoomEvent(UUID roomId, String type, Object payload) {
        RoomEvent event = RoomEvent.builder()
                .type(type)
                .roomId(roomId)
                .payload(payload)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/events",
                event
        );
    }

    private void publishRoomUpdated(Room room) {
        RoomResponse response = buildRoomResponse(room);
        publishRoomEvent(room.getId(), "ROOM_UPDATED", response);
    }

    private void publishPublicRoomEvent(String type, RoomResponse payload) {
        RoomEvent event = RoomEvent.builder()
                .type(type)
                .roomId(payload.getId())
                .payload(payload)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/rooms/public",
                event
        );
    }
}
