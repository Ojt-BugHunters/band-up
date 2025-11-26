package com.project.Band_Up.services.roomChat;

import com.project.Band_Up.dtos.roomChat.MessageDto;

import java.util.UUID;

public interface RoomChatService {
    public void saveMessage(MessageDto messageDto);
    void deleteAllMessagesInRoom(UUID roomId);
}
