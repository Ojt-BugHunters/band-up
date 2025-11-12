'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface ChartCardProps {
    title: string;
    data: Array<{ [key: string]: string | number }>;
    type?: 'line' | 'bar';
    className?: string;
}

export default function ChartCard({
    title,
    data,
    type = 'line',
    className,
}: ChartCardProps) {
    const dataKeys = Object.keys(data[0] || {}).filter(
        (key) => key !== 'date' && key !== 'name',
    );
    const labelKey = data[0]?.date ? 'date' : 'name';

    return (
        <Card className={`border-border/50 ${className}`}>
            <CardHeader className="pb-4">
                <CardTitle className="text-foreground text-lg font-semibold">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    {type === 'line' ? (
                        <LineChart data={data}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border)"
                            />
                            <XAxis
                                dataKey={labelKey}
                                stroke="var(--muted-foreground)"
                            />
                            <YAxis stroke="var(--muted-foreground)" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                }}
                            />
                            {dataKeys.map((key, index) => (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={`var(--chart-${(index % 5) + 1})`}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            ))}
                        </LineChart>
                    ) : (
                        <BarChart data={data}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border)"
                            />
                            <XAxis
                                dataKey={labelKey}
                                stroke="var(--muted-foreground)"
                            />
                            <YAxis stroke="var(--muted-foreground)" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                }}
                            />
                            {dataKeys.map((key, index) => (
                                <Bar
                                    key={key}
                                    dataKey={key}
                                    fill={`var(--chart-${(index % 5) + 1})`}
                                    radius={[8, 8, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
