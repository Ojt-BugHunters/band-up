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
import { CompletionRatePoint } from '@/lib/service/flashcard';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useMemo } from 'react';

const chartConfig = {
    rate: {
        label: 'Completion Rate',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

interface CompletionRateChartProps {
    data: CompletionRatePoint[];
    isLoading?: boolean;
    year: number;
    onYearChange?: (year: number) => void;
    error?: string;
}

export function CompletionRateChart({
    data,
    isLoading,
    year,
    onYearChange,
    error,
}: CompletionRateChartProps) {
    const options = useMemo(() => {
        const now = new Date().getFullYear();
        const uniqueYears = new Set<number>([now, now - 1, now - 2, year]);
        return Array.from(uniqueYears.values()).sort((a, b) => b - a);
    }, [year]);

    const chartBody = (() => {
        if (isLoading) {
            return <Skeleton className="h-[300px] w-full" />;
        }
        if (error) {
            return (
                <div className="text-destructive flex h-[300px] items-center justify-center rounded-md border border-destructive/40 bg-destructive/10 text-sm">
                    Failed to load completion rate: {error}
                </div>
            );
        }
        if (!data.length) {
            return (
                <div className="text-muted-foreground flex h-[300px] items-center justify-center rounded-md border text-sm">
                    No completion rate data for {year}.
                </div>
            );
        }

        return (
            <ChartContainer
                config={chartConfig}
                className="h-[300px] w-full"
            >
                <LineChart data={data} margin={{ left: 12, right: 12 }}>
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
        );
    })();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle>Completion Rate Trend</CardTitle>
                        <CardDescription>
                            Monthly completion rate for the selected year
                        </CardDescription>
                    </div>
                    <Select
                        value={String(year)}
                        onValueChange={(value) =>
                            onYearChange?.(Number(value))
                        }
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option} value={String(option)}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
               <CardDescription>
                    Compare retention trends year over year
                </CardDescription>
            </CardHeader>
            <CardContent>{chartBody}</CardContent>
        </Card>
    );
}
