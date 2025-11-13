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
    { day: 'Mon', avgDuration: 23, maxDuration: 45, minDuration: 12 },
    { day: 'Tue', avgDuration: 24, maxDuration: 48, minDuration: 13 },
    { day: 'Wed', avgDuration: 22, maxDuration: 42, minDuration: 11 },
    { day: 'Thu', avgDuration: 26, maxDuration: 52, minDuration: 14 },
    { day: 'Fri', avgDuration: 25, maxDuration: 50, minDuration: 13 },
    { day: 'Sat', avgDuration: 28, maxDuration: 55, minDuration: 15 },
    { day: 'Sun', avgDuration: 27, maxDuration: 53, minDuration: 14 },
];

export function SessionDurationChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Session Duration Trends</CardTitle>
                <CardDescription>
                    Average session length in minutes this week
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis
                            label={{
                                value: 'Minutes',
                                angle: -90,
                                position: 'insideLeft',
                            }}
                        />
                        <Tooltip formatter={(value) => `${value}m`} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="avgDuration"
                            stroke="#3b82f6"
                            name="Average"
                        />
                        <Line
                            type="monotone"
                            dataKey="maxDuration"
                            stroke="#10b981"
                            name="Max"
                            strokeDasharray="5 5"
                        />
                        <Line
                            type="monotone"
                            dataKey="minDuration"
                            stroke="#ef4444"
                            name="Min"
                            strokeDasharray="5 5"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
