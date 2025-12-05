package com.project.Band_Up.dtos.room;

import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomAnalyticsDto {
    private int rank;
    private String roomName;
    private int numberOfMembers;
    private int weekTrend;
    private int avgDuration;
    private String type;
}

