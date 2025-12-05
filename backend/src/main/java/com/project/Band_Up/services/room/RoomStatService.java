package com.project.Band_Up.services.room;

import com.project.Band_Up.dtos.room.RoomAnalyticsDto;
import com.project.Band_Up.dtos.room.RoomStatsDto;
import com.project.Band_Up.enums.StatsInterval;

import java.util.List;

public interface RoomStatService {

    public void saveHourlyRoomStat();

    public RoomStatsDto getStats(StatsInterval statsInterval);

    public List<RoomAnalyticsDto> getTopRoomsAnalytics();
}

