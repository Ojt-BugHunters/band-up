package com.project.Band_Up.dtos.room;

import com.project.Band_Up.enums.StatsInterval;
import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomStatsDto {

    private int totalRooms;
    private int totalRoomsDifference;

    private int publicRooms;
    private int publicRoomsDifference;

    private int privateRooms;
    private int privateRoomsDifference;

    private int activeMembers;
    private int activeMembersDifference;

    private StatsInterval statsInterval;
}

