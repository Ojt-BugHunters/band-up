'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const data = [
    { day: 'Mon', publicRooms: 400, privateRooms: 240 },
    { day: 'Tue', publicRooms: 520, privateRooms: 280 },
    { day: 'Wed', publicRooms: 480, privateRooms: 320 },
    { day: 'Thu', publicRooms: 680, privateRooms: 380 },
    { day: 'Fri', publicRooms: 750, privateRooms: 420 },
    { day: 'Sat', publicRooms: 680, privateRooms: 390 },
    { day: 'Sun', publicRooms: 620, privateRooms: 350 },
];

export function RoomTrendsChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Room Trends</CardTitle>
                <CardDescription>
                    Weekly public and private room activity
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="publicRooms"
                            stroke="#3b82f6"
                            name="Public Rooms"
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="privateRooms"
                            stroke="#8b5cf6"
                            name="Private Rooms"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
