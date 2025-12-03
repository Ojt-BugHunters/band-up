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

const topRooms = [
    {
        rank: 1,
        name: 'Focus Hour',
        members: 2432,
        trend: 18,
        avgDuration: '28m',
        type: 'Public',
    },
    {
        rank: 2,
        name: 'Study Sprint',
        members: 1824,
        trend: 12,
        avgDuration: '23m',
        type: 'Public',
    },
    {
        rank: 3,
        name: 'Deep Work',
        members: 1245,
        trend: 8,
        avgDuration: '35m',
        type: 'Public',
    },
    {
        rank: 4,
        name: 'Code Marathon',
        members: 956,
        trend: -3,
        avgDuration: '42m',
        type: 'Private',
    },
    {
        rank: 5,
        name: 'Silent Reading',
        members: 842,
        trend: 5,
        avgDuration: '31m',
        type: 'Public',
    },
    {
        rank: 6,
        name: 'Creative Zone',
        members: 724,
        trend: 2,
        avgDuration: '26m',
        type: 'Private',
    },
    {
        rank: 7,
        name: 'Language Lab',
        members: 612,
        trend: 14,
        avgDuration: '19m',
        type: 'Public',
    },
    {
        rank: 8,
        name: 'Music Focus',
        members: 548,
        trend: -2,
        avgDuration: '24m',
        type: 'Private',
    },
];

export function TopRoomsLeaderboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Rooms Leaderboard</CardTitle>
                <CardDescription>
                    Rooms with highest engagement and growth
                </CardDescription>
            </CardHeader>
            <CardContent>
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
                            {topRooms.map((room) => (
                                <TableRow key={room.rank}>
                                    <TableCell className="text-center font-semibold">
                                        {room.rank}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {room.name}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {room.members.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-1">
                                            {room.trend >= 0 ? (
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <TrendingDown className="h-4 w-4 text-red-500" />
                                            )}
                                            <span
                                                className={
                                                    room.trend >= 0
                                                        ? 'font-medium text-green-500'
                                                        : 'font-medium text-red-500'
                                                }
                                            >
                                                {room.trend > 0 ? '+' : ''}
                                                {room.trend}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {room.avgDuration}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span
                                            className={`rounded px-2 py-1 text-xs font-semibold ${
                                                room.type === 'Public'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                            }`}
                                        >
                                            {room.type}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
