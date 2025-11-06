package com.project.Band_Up.services.room;

import com.project.Band_Up.dtos.room.RoomCreateRequest;
import com.project.Band_Up.dtos.room.RoomResponse;
import com.project.Band_Up.dtos.roomMember.RoomMemberResponse;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Room;
import com.project.Band_Up.entities.RoomMember;
import com.project.Band_Up.enums.Role;
import com.project.Band_Up.repositories.AccountRepository;
import com.project.Band_Up.repositories.RoomMemberRepository;
import com.project.Band_Up.repositories.RoomRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
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

    @Override
    public RoomResponse createRoom(UUID creatorId, RoomCreateRequest request) {
        Account creator = accountRepository.findById(creatorId)
                .orElseThrow(() -> new EntityNotFoundException("Creator not found"));

        Room room = modelMapper.map(request, Room.class);
        room.setCreatorId(creator.getId());
        if (room.getIsPrivate() == null) room.setIsPrivate(true);

        Room savedRoom = roomRepository.save(room);

        RoomMember creatorMember = new RoomMember();
        creatorMember.setUser(creator);
        creatorMember.setRoom(savedRoom);
        creatorMember.setRole(Role.Host);
        creatorMember.setJoinedAt(LocalDateTime.now());
        creatorMember.setIsActive(true);
        roomMemberRepository.save(creatorMember);

        return buildRoomResponse(savedRoom);
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
        newMember.setRole(Role.Member);
        newMember.setJoinedAt(LocalDateTime.now());
        newMember.setIsActive(true);
        roomMemberRepository.save(newMember);

        return buildRoomResponse(room);
    }

    @Override
    public void removeMemberFromRoom(UUID roomId, UUID userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));

        List<RoomMember> members = roomMemberRepository.findByRoom(room);
        RoomMember target = members.stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("User not in this room"));

        roomMemberRepository.delete(target);
    }

    @Override
    public RoomResponse updateRoom(UUID roomId, RoomCreateRequest updateRequest) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));

        room.setRoomName(updateRequest.getRoomName());
        room.setDescription(updateRequest.getDescription());
        room.setIsPrivate(updateRequest.isPrivate());
        room.setRoomCode(updateRequest.getRoomCode());

        Room updated = roomRepository.save(room);
        return buildRoomResponse(updated);
    }

    @Override
    public void deleteRoom(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));
        roomRepository.delete(room);
    }

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
                .Id(room.getId().toString())
                .roomName(room.getRoomName())
                .description(room.getDescription())
                .roomCode(room.getRoomCode())
                .isPrivate(room.getIsPrivate())
                .createdBy(room.getCreatorId())
                .memberOfMembers(roomMemberRepository.countByRoom(room))
                .members(memberResponses)
                .createdAt(room.getCreateAt())
                .build();
    }
}
