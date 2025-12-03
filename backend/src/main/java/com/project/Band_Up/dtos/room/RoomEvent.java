package com.project.Band_Up.dtos.room;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class RoomEvent {
    private String type;       // JOIN, LEAVE, TRANSFER_HOST, KICK, UPDATE, DELETE, CREATE, ...
    private UUID roomId;
    private Object payload;    // Tùy event mà FE parse
}
