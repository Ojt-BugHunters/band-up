package com.project.Band_Up.services.room;

import com.project.Band_Up.dtos.room.RoomCreateRequest;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomServiceImpl implements RoomService{
    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final AccountRepository accountRepository;
    private final ModelMapper modelMapper;
    @Override
    public Room createRoom(UUID creatorId, RoomCreateRequest request) {
        Account creator = accountRepository.findById(creatorId)
                .orElseThrow(() -> new EntityNotFoundException("Creator not found"));

        Room room = modelMapper.map(request, Room.class);
        room.setCreatorId(creator.getId());
        if (room.getIsPrivate() == null) {
            room.setIsPrivate(true);
        }

        Room savedRoom = roomRepository.save(room);

        RoomMember creatorMember = new RoomMember();
        creatorMember.setUser(creator);
        creatorMember.setRoom(savedRoom);
        creatorMember.setRole(Role.Host);
        creatorMember.setJoinedAt(LocalDateTime.now());
        creatorMember.setIsActive(true);
        roomMemberRepository.save(creatorMember);

        return savedRoom;
    }

}
