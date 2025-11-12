'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

const completionData = [
    { month: 'Jan', rate: 52 },
    { month: 'Feb', rate: 58 },
    { month: 'Mar', rate: 61 },
    { month: 'Apr', rate: 59 },
    { month: 'May', rate: 65 },
    { month: 'Jun', rate: 68 },
];

const chartConfig = {
    rate: {
        label: 'Completion Rate',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

export function CompletionRateChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Completion Rate Trend</CardTitle>
                <CardDescription>
                    Monthly completion rate over the last 6 months
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                >
                    <LineChart
                        data={completionData}
                        margin={{ left: 12, right: 12 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                            type="monotone"
                            dataKey="rate"
                            stroke="var(--color-rate)"
                            strokeWidth={2}
                            dot={{ fill: 'var(--color-rate)' }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
