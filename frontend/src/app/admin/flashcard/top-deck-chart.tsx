'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    XAxis,
    YAxis,
} from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { mockMostDecksData } from './page.data';

export const description = 'Top 10 decks by unique learners';

const chartConfig = {
    learners: {
        label: 'Learners',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

export function TopDecksChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Top 10 Most Learned Decks</CardTitle>
                <CardDescription>
                    Decks with the highest number of unique learners
                </CardDescription>
            </CardHeader>

            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={mockMostDecksData}
                        layout="vertical"
                        margin={{ left: 12, right: 16, top: 8, bottom: 8 }}
                    >
                        <CartesianGrid horizontal={false} />

                        <YAxis
                            dataKey="deck"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            width={160}
                        />

                        <XAxis
                            dataKey="learners"
                            type="number"
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) =>
                                Intl.NumberFormat().format(Number(v))
                            }
                        />

                        <ChartTooltip
                            cursor={{ fillOpacity: 0.04 }}
                            content={
                                <ChartTooltipContent
                                    nameKey="learners"
                                    formatter={(value) =>
                                        Intl.NumberFormat().format(
                                            Number(value as number),
                                        )
                                    }
                                />
                            }
                        />

                        <Bar
                            dataKey="learners"
                            radius={4}
                            fill="var(--color-learners)"
                        >
                            <LabelList
                                dataKey="learners"
                                position="right"
                                offset={8}
                                className="fill-foreground"
                                formatter={(v: number) =>
                                    Intl.NumberFormat().format(v)
                                }
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>

            <CardFooter className="text-muted-foreground text-sm">
                Showing unique learners per deck (top 10)
            </CardFooter>
        </Card>
    );
}
