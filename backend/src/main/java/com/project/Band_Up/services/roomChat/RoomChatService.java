package com.project.Band_Up.services.roomChat;

import com.project.Band_Up.dtos.roomChat.MessageDto;

public interface RoomChatService {
    public void saveMessage(MessageDto messageDto);
}
