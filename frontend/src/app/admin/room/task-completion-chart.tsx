'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const data = [
    { week: 'Week 1', completed: 2847, total: 3456, rate: 82 },
    { week: 'Week 2', completed: 3124, total: 3720, rate: 84 },
    { week: 'Week 3', completed: 3456, total: 4032, rate: 86 },
    { week: 'Week 4', completed: 3892, total: 4520, rate: 86 },
];

export function TaskCompletionChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Task Completion Rate</CardTitle>
                <CardDescription>
                    Weekly task completion trends across all rooms
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis
                            yAxisId="left"
                            label={{
                                value: 'Tasks',
                                angle: -90,
                                position: 'insideLeft',
                            }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            label={{
                                value: 'Completion %',
                                angle: 90,
                                position: 'insideRight',
                            }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                            yAxisId="left"
                            dataKey="completed"
                            fill="#10b981"
                            name="Completed"
                        />
                        <Bar
                            yAxisId="left"
                            dataKey="total"
                            fill="#e5e7eb"
                            name="Total"
                        />
                    </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-2">
                    {data.map((item) => (
                        <div
                            key={item.week}
                            className="flex items-center justify-between text-sm"
                        >
                            <span>{item.week}</span>
                            <div className="flex items-center gap-3">
                                <div className="bg-secondary h-2 w-32 rounded-full">
                                    <div
                                        className="h-2 rounded-full bg-green-500"
                                        style={{ width: `${item.rate}%` }}
                                    />
                                </div>
                                <span className="w-12 text-right font-medium">
                                    {item.rate}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
