package com.project.Band_Up.services.roomChat;

import com.project.Band_Up.dtos.roomChat.MessageDto;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Room;
import com.project.Band_Up.entities.RoomChat;
import com.project.Band_Up.repositories.RoomChatRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class RoomChatServiceImpl implements RoomChatService {

    @Autowired
    private RoomChatRepository roomChatRepository;
    @Autowired
    private ModelMapper modelMapper;
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public void saveMessage(MessageDto messageDto) {
        // map dto to entity (fields like content, createdAt, etc.)
        RoomChat roomChat = modelMapper.map(messageDto, RoomChat.class);

        // obtain managed references instead of creating new transient instances
        UUID roomId = messageDto.getTarget(); // assumes MessageDto has getRoom().getId()
        UUID accountId = messageDto.getSender().getId();

        Room roomRef = entityManager.getReference(Room.class, roomId);
        Account accountRef = entityManager.getReference(Account.class, accountId);

        roomChat.setRoom(roomRef);
        roomChat.setAccount(accountRef);

        roomChatRepository.save(roomChat);
    }
}
