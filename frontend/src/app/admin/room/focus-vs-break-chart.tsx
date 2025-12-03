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

const data = [
    { name: 'Focus Time', value: 68, hours: 2456 },
    { name: 'Short Breaks', value: 18, hours: 648 },
    { name: 'Long Breaks', value: 14, hours: 504 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

export function FocusVsBreakChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Focus vs Break Distribution</CardTitle>
                <CardDescription>
                    Time breakdown across all study sessions this week
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index]}
                                />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-2 text-sm">
                    {data.map((item, index) => (
                        <div
                            key={item.name}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index] }}
                                />
                                <span>{item.name}</span>
                            </div>
                            <span className="font-medium">
                                {item.hours.toLocaleString()} hours
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
