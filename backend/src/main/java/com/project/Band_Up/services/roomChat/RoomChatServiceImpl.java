package com.project.Band_Up.services.roomChat;

import com.project.Band_Up.dtos.roomChat.MessageDto;
import com.project.Band_Up.entities.Account;
import com.project.Band_Up.entities.Room;
import com.project.Band_Up.entities.RoomChat;
import com.project.Band_Up.repositories.RoomChatRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoomChatServiceImpl implements RoomChatService {

    @Autowired
    private RoomChatRepository roomChatRepository;
    @Autowired
    private ModelMapper modelMapper;

    @Override
    public void saveMessage(MessageDto messageDto) {
        RoomChat roomChat = modelMapper.map(messageDto, RoomChat.class);
        Room room = new Room();
        room.setId(roomChat.getId());
        Account account = Account.builder().id(messageDto.getSender().getId()).build();
        roomChat.setRoom(room);
        roomChat.setAccount(account);
        roomChatRepository.save(roomChat);
    }
}
