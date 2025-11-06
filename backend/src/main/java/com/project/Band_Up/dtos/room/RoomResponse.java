package com.project.Band_Up.dtos.room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.joda.time.DateTime;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomResponse {
    private String Id;
    private String roomName;
    private String description;
    private String roomCode;
    private Boolean isPrivate;
    private UUID createdBy;
    private DateTime createdAt;
}
