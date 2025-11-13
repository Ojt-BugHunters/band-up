package com.project.Band_Up.handlers.listeners;

import com.project.Band_Up.dtos.roomChat.MessageDto;
import com.project.Band_Up.dtos.roomChat.SenderDto;
import com.project.Band_Up.enums.RoomAction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.UUID;

@Component
public class WebSocketEventListener {
    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        SenderDto sender = (SenderDto) accessor.getSessionAttributes().get("sender");
        UUID roomId = (UUID) accessor.getSessionAttributes().get("roomId");

        if(sender != null) {
            MessageDto messageDto = MessageDto.builder()
                    .target(roomId)
                    .action(RoomAction.LEAVE)
                    .sender(sender)
                    .build();
            messagingTemplate.convertAndSend("/topic/room/" + roomId, messageDto);
        }
    }
}
