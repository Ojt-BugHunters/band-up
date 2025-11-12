'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
import { engagementData } from './page.data';

const chartConfig = {
    sessions: {
        label: 'Sessions',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

export function EngagementMetricsChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Weekly Engagement</CardTitle>
                <CardDescription>
                    Study sessions by day of the week
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                >
                    <BarChart
                        // TODO: Change the real data from backend here
                        data={engagementData}
                        margin={{ left: 12, right: 12 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                            dataKey="sessions"
                            fill="var(--color-sessions)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
