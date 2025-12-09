'use client';

import { RoomTypesChart } from './room-types-chart';
import { TopRoomsLeaderboard } from './top-rooms-leaderboard';
import { BarChart3, Users, Lock, Unlock } from 'lucide-react';
import { StatCard } from '@/components/admin-stats-card';
import { useGetRoomStats } from '@/lib/service/room';

const numberFormatter = new Intl.NumberFormat('en-US');

const formatStatValue = (value?: number, loading?: boolean) => {
    if (loading) {
        return 'Loading...';
    }
    if (value === undefined || value === null || Number.isNaN(value)) {
        return '—';
    }
    return numberFormatter.format(value);
};

const formatStatChange = (difference?: number, loading?: boolean) => {
    if (loading) {
        return 'Updating';
    }
    if (
        difference === undefined ||
        difference === null ||
        Number.isNaN(difference)
    ) {
        return 'No data';
    }
    if (difference === 0) {
        return 'No change';
    }
    const formatted = numberFormatter.format(Math.abs(difference));
    return `${difference > 0 ? '+' : '-'}${formatted}`;
};

const isPositiveTrend = (difference?: number) => {
    if (
        difference === undefined ||
        difference === null ||
        Number.isNaN(difference)
    ) {
        return true;
    }
    if (difference === 0) {
        return true;
    }
    return difference > 0;
};

export default function RoomsAnalyticsPage() {
    const {
        data: roomStats,
        isLoading: isLoadingRoomStats,
        isFetching: isFetchingRoomStats,
        error: roomStatsError,
    } = useGetRoomStats('WEEKLY');
    const isStatsLoading = isLoadingRoomStats || isFetchingRoomStats;
    const statsErrorMessage =
        roomStatsError instanceof Error ? roomStatsError.message : undefined;
    const statCards = [
        {
            title: 'Total Rooms',
            value: formatStatValue(roomStats?.totalRooms, isStatsLoading),
            change: formatStatChange(
                roomStats?.totalRoomsDifference,
                isStatsLoading,
            ),
            icon: BarChart3,
            isPositive: isPositiveTrend(roomStats?.totalRoomsDifference),
        },
        {
            title: 'Public Rooms',
            value: formatStatValue(roomStats?.publicRooms, isStatsLoading),
            change: formatStatChange(
                roomStats?.publicRoomsDifference,
                isStatsLoading,
            ),
            icon: Unlock,
            isPositive: isPositiveTrend(roomStats?.publicRoomsDifference),
        },
        {
            title: 'Private Rooms',
            value: formatStatValue(roomStats?.privateRooms, isStatsLoading),
            change: formatStatChange(
                roomStats?.privateRoomsDifference,
                isStatsLoading,
            ),
            icon: Lock,
            isPositive: isPositiveTrend(roomStats?.privateRoomsDifference),
        },
        {
            title: 'Active Members',
            value: formatStatValue(roomStats?.activeMembers, isStatsLoading),
            change: formatStatChange(
                roomStats?.activeMembersDifference,
                isStatsLoading,
            ),
            icon: Users,
            isPositive: isPositiveTrend(roomStats?.activeMembersDifference),
        },
    ];
    return (
        <div className="m-4 mt-2 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Rooms Analytics Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                    Comprehensive insights and control for your Pomodoro rooms
                    platform
                </p>
            </div>

            {statsErrorMessage && (
                <p className="text-destructive text-sm">
                    Failed to load overview stats: {statsErrorMessage}
                </p>
            )}

            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <StatCard
                            key={card.title}
                            title={card.title}
                            value={card.value}
                            change={card.change}
                            icon={card.icon}
                            isPositive={card.isPositive}
                        />
                    ))}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                    <RoomTypesChart
                        publicRooms={roomStats?.publicRooms}
                        privateRooms={roomStats?.privateRooms}
                        isLoading={isStatsLoading}
                    />
                    <TopRoomsLeaderboard />
                </div>
            </div>
        </div>
    );
}
