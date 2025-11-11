'use client';

import { Pie, PieChart } from 'recharts';

import { CardContent } from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import { cardStatusChartData } from './page.data';

export const description = 'A pie chart with a legend';

const chartConfig = {
    new: {
        label: 'New',
        color: 'var(--chart-1)',
    },
    learning: {
        label: 'Learning',
        color: 'var(--chart-2)',
    },
    mastered: {
        label: 'Mastered',
        color: 'var(--chart-3)',
    },
} satisfies ChartConfig;

const totalCards = cardStatusChartData.reduce(
    (sum, item) => sum + item.count,
    0,
);

const renderCustomLabel = (entry: {
    count: number;
    payload?: { status: string };
}) => {
    const percentage = ((entry.count / totalCards) * 100).toFixed(1);
    return `${percentage}%`;
};

export function CardStatusChart() {
    return (
        <CardContent className="flex-1 pb-0">
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[300px]"
            >
                <PieChart>
                    <Pie
                        data={cardStatusChartData}
                        dataKey="count"
                        label={renderCustomLabel}
                        labelLine={false}
                    />
                    <ChartLegend
                        content={<ChartLegendContent nameKey="status" />}
                        className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                    />
                </PieChart>
            </ChartContainer>
        </CardContent>
    );
}
