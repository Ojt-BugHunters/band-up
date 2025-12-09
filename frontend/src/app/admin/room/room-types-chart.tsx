'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

type RoomTypesChartProps = {
    publicRooms?: number;
    privateRooms?: number;
    isLoading?: boolean;
};

export function RoomTypesChart({
    publicRooms,
    privateRooms,
    isLoading,
}: RoomTypesChartProps) {
    const data = [
        { name: 'Public', value: publicRooms ?? 0, color: '#3b82f6' },
        { name: 'Private', value: privateRooms ?? 0, color: '#8b5cf6' },
    ];
    const totalRooms = data.reduce((sum, item) => sum + item.value, 0);
    const hasData = totalRooms > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Room Types Distribution</CardTitle>
                <CardDescription>
                    Public vs Private rooms breakdown
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p className="text-muted-foreground text-sm">
                        Loading room type distribution...
                    </p>
                ) : hasData ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name} ${Number.isFinite(percent) ? (percent * 100).toFixed(0) : 0}%`
                                }
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-muted-foreground text-sm">
                        No room type data available.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
