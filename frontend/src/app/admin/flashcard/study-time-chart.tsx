'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
import { studyTimeData } from './page.data';

const chartConfig = {
    minutes: {
        label: 'Study Time (min)',
        color: 'var(--chart-3)',
    },
} satisfies ChartConfig;

export function StudyTimeChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Average Study Time</CardTitle>
                <CardDescription>Weekly average per user</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                >
                    {/* TODO: replace real data from API here */}
                    <AreaChart
                        data={studyTimeData}
                        margin={{ left: 12, right: 12 }}
                    >
                        <defs>
                            <linearGradient
                                id="fillMinutes"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-minutes)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-minutes)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="week"
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
                        <Area
                            type="monotone"
                            dataKey="minutes"
                            stroke="var(--color-minutes)"
                            fill="url(#fillMinutes)"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
