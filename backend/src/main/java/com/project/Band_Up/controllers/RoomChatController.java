package com.project.Band_Up.controllers;

import com.project.Band_Up.dtos.roomChat.MessageDto;
import com.project.Band_Up.services.media.MediaService;
import com.project.Band_Up.services.roomChat.RoomChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.UUID;

@Controller
@Tag(name = "WebSocket Chat", description = "WebSocket endpoints for real-time chat functionality. " +
        "Connect to /ws endpoint using SockJS and STOMP protocol. " +
        "Subscribe to /topic/{target} to receive messages. " +
        "Send messages to /app/chat.sendMessage.")
public class RoomChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private MediaService mediaService;
    @Autowired
    private RoomChatService roomChatService;

    @MessageMapping("/chat.sendMessage")
    @Operation(
            summary = "Send a chat message via WebSocket",
            description = "**WebSocket Endpoint** - Sends a chat message to a specific room/channel. " +
                    "All clients subscribed to `/topic/{target}` will receive the message.\n\n" +
                    "**Connection Details:**\n" +
                    "- WebSocket URL: `ws://localhost:8080/ws` (with SockJS)\n" +
                    "- Send to: `/app/chat.sendMessage`\n" +
                    "- Subscribe to: `/topic/room/{target}` (e.g., `/topic/room-1`)\n\n" +
                    "**Flow:**\n" +
                    "1. Client connects to `/ws` using SockJS\n" +
                    "2. Client subscribes to `/topic/room/{roomId}` to receive messages\n" +
                    "3. Client sends message to `/app/chat.sendMessage`\n" +
                    "4. Server broadcasts message to all subscribers of `/topic/{target}`\n\n" +
                    "**Note:** Images URLs will be automatically converted to CloudFront signed URLs.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Message successfully sent and broadcasted to topic subscribers",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = MessageDto.class)
                            )
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid message format or missing required fields"
                    )
            }
    )
    public void sendMessage(
            @Parameter(
                    description = "Message payload containing sender UUID, target room/channel, content, and optional images",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = MessageDto.class),
                            examples = @ExampleObject(
                                    name = "Chat Message Example",
                                    value = "{\n" +
                                            "  \"sender\": \"123e4567-e89b-12d3-a456-426614174000\",\n" +
                                            "  \"target\": \"room-1\",\n" +
                                            "  \"content\": \"Hello everyone!\",\n" +
                                            "  \"images\": [\"path/to/image1.jpg\", \"path/to/image2.jpg\"]\n" +
                                            "}"
                            )
                    )
            )
            @Payload MessageDto messageDto) {
        if(messageDto.getImages() != null && !messageDto.getImages().isEmpty()) {
            for (String image : messageDto.getImages()) {
                image = mediaService.createCloudFrontSignedUrl(image).getCloudFrontUrl();
            }
        }
        roomChatService.saveMessage(messageDto);
        messagingTemplate.convertAndSend("/topic/room/" + messageDto.getTarget(), messageDto);
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload MessageDto messageDto,
                        SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("sender", messageDto.getSender());
        headerAccessor.getSessionAttributes().put("roomId", messageDto.getTarget());
        messagingTemplate.convertAndSend("/topic/room/" + messageDto.getTarget(), messageDto);
    }
}
