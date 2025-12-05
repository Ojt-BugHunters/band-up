package com.project.Band_Up.services.room;

import com.project.Band_Up.dtos.room.RoomAnalyticsDto;
import com.project.Band_Up.dtos.room.RoomStatsDto;
import com.project.Band_Up.entities.Room;
import com.project.Band_Up.entities.RoomStat;
import com.project.Band_Up.enums.StatsInterval;
import com.project.Band_Up.repositories.RoomMemberRepository;
import com.project.Band_Up.repositories.RoomRepository;
import com.project.Band_Up.repositories.RoomStatRepository;
import com.project.Band_Up.repositories.StudySessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
public class RoomStatServiceImpl implements RoomStatService {

    @Autowired
    private RoomStatRepository roomStatRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private RoomMemberRepository roomMemberRepository;
    @Autowired
    private StudySessionRepository studySessionRepository;

    private final Random random = new Random();

    @Override
    @Scheduled(cron = "0 0 * * * *") // Run every hour at the start of the hour
    public void saveHourlyRoomStat() {
        int totalRooms = (int) roomRepository.count();
        int publicRooms = roomRepository.findByPrivateRoomFalse().size();
        int privateRooms = totalRooms - publicRooms;

        // Count members who joined in the previous hour
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourAgo = now.minusHours(1);
        int activeMembers = (int) roomMemberRepository.countByJoinedAtBetween(oneHourAgo, now);

        RoomStat roomStat = RoomStat.builder()
                .totalRooms(totalRooms)
                .publicRooms(publicRooms)
                .privateRooms(privateRooms)
                .activeMembers(activeMembers)
                .recordedAt(LocalDateTime.now())
                .build();

        roomStatRepository.save(roomStat);
    }

    @Override
    public RoomStatsDto getStats(StatsInterval statsInterval) {
        int totalRooms = (int) roomRepository.count();
        int publicRooms = roomRepository.findByPrivateRoomFalse().size();
        int privateRooms = totalRooms - publicRooms;
        int activeMembers = (int) roomMemberRepository.count();

        LocalDateTime targetDate = LocalDateTime.now();
        switch (statsInterval) {
            case HOURLY:
                targetDate = targetDate.minusHours(1);
                break;
            case DAILY:
                targetDate = targetDate.minusDays(1);
                break;
            case WEEKLY:
                targetDate = targetDate.minusWeeks(1);
                break;
            case MONTHLY:
                targetDate = targetDate.minusMonths(1);
                break;
        }

        final int finalTotalRooms = totalRooms;
        final int finalPublicRooms = publicRooms;
        final int finalPrivateRooms = privateRooms;
        final int finalActiveMembers = activeMembers;

        var previousStats = roomStatRepository.findTopByRecordedAtBeforeOrderByRecordedAtDesc(targetDate);

        int totalRoomsDifference = previousStats.map(stats -> finalTotalRooms - stats.getTotalRooms()).orElse(0);
        int publicRoomsDifference = previousStats.map(stats -> finalPublicRooms - stats.getPublicRooms()).orElse(0);
        int privateRoomsDifference = previousStats.map(stats -> finalPrivateRooms - stats.getPrivateRooms()).orElse(0);
        int activeMembersDifference = previousStats.map(stats -> finalActiveMembers - stats.getActiveMembers()).orElse(0);

        return RoomStatsDto.builder()
                .totalRooms(totalRooms)
                .totalRoomsDifference(totalRoomsDifference)
                .publicRooms(publicRooms)
                .publicRoomsDifference(publicRoomsDifference)
                .privateRooms(privateRooms)
                .privateRoomsDifference(privateRoomsDifference)
                .activeMembers(activeMembers)
                .activeMembersDifference(activeMembersDifference)
                .statsInterval(statsInterval)
                .build();
    }

    @Override
    public List<RoomAnalyticsDto> getTopRoomsAnalytics() {
        // Get top rooms by active member count
        List<Object[]> topRoomsData = roomMemberRepository.findTopRoomsByActiveMemberCount();

        // Get average focus time for all rooms
        List<Object[]> avgFocusTimeData = studySessionRepository.findAverageFocusTimeByRoom();
        java.util.Map<UUID, Double> avgFocusTimeMap = new java.util.HashMap<>();
        for (Object[] data : avgFocusTimeData) {
            UUID roomId = (UUID) data[0];
            Double avgFocusTime = (Double) data[1]; // Average in milliseconds
            avgFocusTimeMap.put(roomId, avgFocusTime);
        }

        List<RoomAnalyticsDto> analyticsList = new ArrayList<>();
        int rank = 1;

        for (Object[] data : topRoomsData) {
            if (rank > 10) break; // Only top 10

            UUID roomId = (UUID) data[0];
            Long memberCount = (Long) data[1];

            Room room = roomRepository.findById(roomId).orElse(null);
            if (room == null) continue;

            // Generate random week trend between -20 and +30
            int weekTrend = random.nextInt(51) - 20; // Range: -20 to +30

            // Calculate avg duration from study sessions (convert milliseconds to minutes)
            int avgDuration;
            if (avgFocusTimeMap.containsKey(roomId)) {
                Double avgFocusTimeMs = avgFocusTimeMap.get(roomId);
                avgDuration = (int) (avgFocusTimeMs / 60000); // Convert ms to minutes
                // Ensure minimum of 1 minute if there's data
                if (avgDuration < 1) avgDuration = 1;
            } else {
                // Default random value if no study session data available
                avgDuration = random.nextInt(106) + 15; // Range: 15 to 120
            }

            String type = (room.getPrivateRoom() != null && room.getPrivateRoom()) ? "private" : "public";

            RoomAnalyticsDto analytics = RoomAnalyticsDto.builder()
                    .rank(rank)
                    .roomName(room.getRoomName())
                    .numberOfMembers(memberCount.intValue())
                    .weekTrend(weekTrend)
                    .avgDuration(avgDuration)
                    .type(type)
                    .build();

            analyticsList.add(analytics);
            rank++;
        }

        return analyticsList;
    }
}


