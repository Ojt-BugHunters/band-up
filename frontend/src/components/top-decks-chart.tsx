'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

// Sample data for top 10 decks
const topDecksData = [
    { name: 'IELTS Vocabulary', learners: 520 },
    { name: 'TOEFL Essential Words', learners: 485 },
    { name: 'Business English', learners: 450 },
    { name: 'Daily Conversation', learners: 420 },
    { name: 'Medical Terminology', learners: 395 },
    { name: 'Japanese Hiragana', learners: 370 },
    { name: 'Spanish Basics', learners: 345 },
    { name: 'French Phrases', learners: 320 },
    { name: 'German Grammar', learners: 295 },
    { name: 'Chinese Characters', learners: 270 },
];

const chartConfig = {
    learners: {
        label: 'Learners',
        color: 'hsl(var(--chart-2))',
    },
};

const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

export function TopDecksChart() {
    return (
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={topDecksData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 12 }}
                        width={190}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                        dataKey="learners"
                        fill="var(--color-learners)"
                        radius={4}
                    >
                        {topDecksData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
