'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useGetTopRoomsAnalytics } from '@/lib/service/room';

const numberFormatter = new Intl.NumberFormat('en-US');

const formatRoomType = (type: string | undefined) => {
    if (!type) return 'Unknown';
    const normalized = type.toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export function TopRoomsLeaderboard() {
    const {
        data: topRooms,
        isLoading,
        isFetching,
        error,
    } = useGetTopRoomsAnalytics();
    const isLoadingLeaderboard = isLoading || isFetching;
    const analytics = topRooms ?? [];
    const errorMessage = error instanceof Error ? error.message : undefined;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Rooms Leaderboard</CardTitle>
                <CardDescription>
                    Rooms with highest engagement and growth
                </CardDescription>
            </CardHeader>
            <CardContent>
                {errorMessage && (
                    <p className="text-destructive mb-3 text-sm">
                        Không thể tải top rooms: {errorMessage}
                    </p>
                )}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 text-center">
                                    Rank
                                </TableHead>
                                <TableHead>Room Name</TableHead>
                                <TableHead className="text-right">
                                    Members
                                </TableHead>
                                <TableHead className="text-center">
                                    Week Trend
                                </TableHead>
                                <TableHead className="text-center">
                                    Avg Duration
                                </TableHead>
                                <TableHead className="text-center">
                                    Type
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingLeaderboard ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-sm text-muted-foreground"
                                    >
                                        Đang tải danh sách top rooms...
                                    </TableCell>
                                </TableRow>
                            ) : analytics.length > 0 ? (
                                analytics.map((room) => (
                                    <TableRow key={room.rank}>
                                        <TableCell className="text-center font-semibold">
                                            {room.rank}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {room.roomName}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {numberFormatter.format(
                                                room.numberOfMembers,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-1">
                                                {room.weekTrend >= 0 ? (
                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                                )}
                                                <span
                                                    className={
                                                        room.weekTrend >= 0
                                                            ? 'font-medium text-green-500'
                                                            : 'font-medium text-red-500'
                                                    }
                                                >
                                                    {room.weekTrend > 0
                                                        ? '+'
                                                        : ''}
                                                    {room.weekTrend}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {room.avgDuration}m
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-semibold ${
                                                    room.type?.toLowerCase() ===
                                                    'public'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                }`}
                                            >
                                                {formatRoomType(room.type)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-sm text-muted-foreground"
                                    >
                                        Không có dữ liệu top rooms.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
