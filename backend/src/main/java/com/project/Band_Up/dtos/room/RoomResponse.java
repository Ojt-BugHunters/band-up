package com.project.Band_Up.dtos.room;

import com.project.Band_Up.dtos.roomMember.RoomMemberResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomResponse {
    private UUID Id;
    private String roomName;
    private String description;
    private String roomCode;
    private Boolean isPrivate;
    private UUID createdBy;
    private Integer memberOfMembers;
    List<RoomMemberResponse> members;
    private LocalDateTime createdAt;
}
