package com.project.Band_Up.dtos.room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomUpdateRequest {
    private String roomName;
    private String description;
    private boolean isPrivate;
}
