package com.project.Band_Up.dtos.roomMember;

import com.project.Band_Up.enums.Role;
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
public class RoomMemberCreateRequest {
    private UUID roomId;
    private UUID userId;
    private Role role;
    private LocalDateTime joinedAt;
}
