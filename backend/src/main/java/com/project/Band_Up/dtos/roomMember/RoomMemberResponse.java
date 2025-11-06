package com.project.Band_Up.dtos.roomMember;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomMemberResponse {
    private UUID id;
    private UUID roomId;
    private UUID userId;
    private String role;
    private LocalDateTime joinedAt;
}
