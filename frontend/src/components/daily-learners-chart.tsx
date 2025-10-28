'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

// Sample data for daily learners
const dailyLearnersData = [
    { date: '2025-09-11', learners: 120 },
    { date: '2025-09-12', learners: 145 },
    { date: '2025-09-13', learners: 132 },
    { date: '2025-09-14', learners: 178 },
    { date: '2025-09-15', learners: 165 },
    { date: '2025-09-16', learners: 192 },
    { date: '2025-09-17', learners: 210 },
    { date: '2025-09-18', learners: 198 },
    { date: '2025-09-19', learners: 225 },
    { date: '2025-09-20', learners: 240 },
    { date: '2025-09-21', learners: 215 },
    { date: '2025-09-22', learners: 260 },
    { date: '2025-09-23', learners: 275 },
    { date: '2025-09-24', learners: 290 },
    { date: '2025-09-25', learners: 310 },
    { date: '2025-09-26', learners: 325 },
    { date: '2025-09-27', learners: 340 },
    { date: '2025-09-28', learners: 355 },
    { date: '2025-09-29', learners: 370 },
    { date: '2025-09-30', learners: 385 },
    { date: '2025-10-01', learners: 395 },
    { date: '2025-10-02', learners: 410 },
    { date: '2025-10-03', learners: 425 },
    { date: '2025-10-04', learners: 440 },
    { date: '2025-10-05', learners: 455 },
    { date: '2025-10-06', learners: 470 },
    { date: '2025-10-07', learners: 485 },
    { date: '2025-10-08', learners: 500 },
    { date: '2025-10-09', learners: 515 },
    { date: '2025-10-10', learners: 340 },
];

const chartConfig = {
    learners: {
        label: 'Learners',
        color: 'hsl(var(--chart-1))',
    },
};

export function DailyLearnersChart() {
    return (
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyLearnersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        interval={Math.floor(dailyLearnersData.length / 6)}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                        type="monotone"
                        dataKey="learners"
                        stroke="var(--color-learners)"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
