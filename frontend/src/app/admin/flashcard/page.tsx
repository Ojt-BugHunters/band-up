'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TopDecksChart } from './top-deck-chart';
import { FlashcardTable } from './flashcard-table';
import { CompletionRateChart } from './completion-rate-chart';
import { Brain, Users, CreditCard, Target, Zap } from 'lucide-react';
import { StatCard } from '@/components/admin-stats-card';
import {
    useGetFlashcardCompletionRate,
    useGetFlashcardStats,
} from '@/lib/service/flashcard';
import { useState } from 'react';
import { StatsInterval } from '@/lib/service/stats';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const numberFormatter = new Intl.NumberFormat('en-US');

const formatStatValue = (value?: number, loading?: boolean) => {
    if (loading) return 'Loading...';
    if (value === undefined || value === null || Number.isNaN(value)) {
        return '—';
    }
    return numberFormatter.format(value);
};

const formatStatChange = (difference?: number, loading?: boolean) => {
    if (loading) return 'Updating...';
    if (
        difference === undefined ||
        difference === null ||
        Number.isNaN(difference)
    ) {
        return 'No change';
    }
    if (difference === 0) return 'No change';
    const formatted = numberFormatter.format(Math.abs(difference));
    return `${difference > 0 ? '+' : '-'}${formatted}`;
};

const isPositiveTrend = (difference?: number) => {
    if (
        difference === undefined ||
        difference === null ||
        Number.isNaN(difference)
    ) {
        return true;
    }
    if (difference === 0) return true;
    return difference > 0;
};

const formatPercentage = (value?: number, loading?: boolean) => {
    if (loading) return 'Loading...';
    if (value === undefined || value === null || Number.isNaN(value)) {
        return '—';
    }
    return `${(value * 100).toFixed(1)}%`;
};

const formatPercentageChange = (value?: number, loading?: boolean) => {
    if (loading) return 'Updating...';
    if (value === undefined || value === null || Number.isNaN(value)) {
        return 'No change';
    }
    if (value === 0) return 'No change';
    const formatted = Math.abs(value * 100).toFixed(1);
    return `${value > 0 ? '+' : '-'}${formatted}%`;
};

const getCompletionRatePercent = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
        return 0;
    }
    return Math.max(0, Math.min(100, Number(value) * 100));
};

export default function FlashcardPage() {
    const [statsInterval, setStatsInterval] = useState<StatsInterval>('WEEKLY');
    const [completionYear, setCompletionYear] = useState(
        new Date().getFullYear(),
    );
    const {
        data: flashcardStats,
        isLoading: isLoadingStats,
        isFetching: isFetchingStats,
        error: flashcardStatsError,
    } = useGetFlashcardStats(statsInterval);
    const {
        data: completionRateData,
        isLoading: isLoadingCompletion,
        isFetching: isFetchingCompletion,
        error: completionRateError,
    } = useGetFlashcardCompletionRate(completionYear);

    const isStatsLoading = isLoadingStats || isFetchingStats;
    const isCompletionLoading = isLoadingCompletion || isFetchingCompletion;

    const statsErrorMessage =
        flashcardStatsError instanceof Error
            ? flashcardStatsError.message
            : undefined;
    const completionErrorMessage =
        completionRateError instanceof Error
            ? completionRateError.message
            : undefined;

    const totalDecksValue =
        flashcardStats?.activeDecks ?? flashcardStats?.totalDecks;
    const completionRatePercent = getCompletionRatePercent(
        flashcardStats?.completionRate,
    );

    const overviewCards = [
        {
            title: 'Total Learners',
            value: formatStatValue(
                flashcardStats?.totalLearners,
                isStatsLoading,
            ),
            change: formatStatChange(
                flashcardStats?.totalLearnersDifference,
                isStatsLoading,
            ),
            icon: Users,
            isPositive: isPositiveTrend(
                flashcardStats?.totalLearnersDifference,
            ),
        },
        {
            title: 'Total Cards',
            value: formatStatValue(flashcardStats?.totalCards, isStatsLoading),
            change: formatStatChange(
                flashcardStats?.totalCardsDifference,
                isStatsLoading,
            ),
            icon: CreditCard,
            isPositive: isPositiveTrend(flashcardStats?.totalCardsDifference),
        },
        {
            title: 'Active Decks',
            value: formatStatValue(totalDecksValue, isStatsLoading),
            change: formatStatChange(
                flashcardStats?.activeDecksDifference,
                isStatsLoading,
            ),
            icon: Brain,
            isPositive: isPositiveTrend(flashcardStats?.activeDecksDifference),
        },
        {
            title: 'Completion Rate',
            value: formatPercentage(
                flashcardStats?.completionRate,
                isStatsLoading,
            ),
            change: formatPercentageChange(
                flashcardStats?.completionRateDifference,
                isStatsLoading,
            ),
            icon: Target,
            isPositive: isPositiveTrend(
                flashcardStats?.completionRateDifference,
            ),
        },
    ];

    const todayActivity = [
        {
            label: 'Active Learners',
            value: formatStatValue(
                flashcardStats?.totalLearners,
                isStatsLoading,
            ),
        },
        {
            label: 'Cards Reviewed',
            value: formatStatValue(flashcardStats?.totalCards, isStatsLoading),
        },
        {
            label: 'Decks Available',
            value: formatStatValue(totalDecksValue, isStatsLoading),
        },
    ];

    const weeklyTrends = [
        {
            label: 'Completion Rate',
            value: formatPercentage(
                flashcardStats?.completionRate,
                isStatsLoading,
            ),
        },
        {
            label: 'Learner Delta',
            value: formatStatChange(
                flashcardStats?.totalLearnersDifference,
                isStatsLoading,
            ),
        },
        {
            label: 'Deck Delta',
            value: formatStatChange(
                flashcardStats?.activeDecksDifference,
                isStatsLoading,
            ),
        },
    ];

    return (
        <div className="m-4 mt-2 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Flashcard Analytics Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                    Comprehensive insights and control for your learning
                    platform
                </p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-muted-foreground text-sm">
                            {statsErrorMessage
                                ? `Failed to refresh stats: ${statsErrorMessage}`
                                : `Comparing ${statsInterval.toLowerCase()} performance`}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm">
                                Interval
                            </span>
                            <Select
                                value={statsInterval}
                                onValueChange={(value) =>
                                    setStatsInterval(value as StatsInterval)
                                }
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Interval" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DAILY">Daily</SelectItem>
                                    <SelectItem value="WEEKLY">
                                        Weekly
                                    </SelectItem>
                                    <SelectItem value="MONTHLY">
                                        Monthly
                                    </SelectItem>
                                    <SelectItem value="YEARLY">
                                        Yearly
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {overviewCards.map((card) => (
                            <StatCard key={card.title} {...card} />
                        ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[2fr,3fr]">
                        {/* Overview - Performance - Need to connect API here */}
                        <Card className="md:col-span-2 lg:col-span-1 lg:row-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5" />
                                    Performance Overview
                                </CardTitle>
                                <CardDescription>
                                    Real-time platform insights
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="text-muted-foreground text-sm font-medium">
                                            Today Activity
                                        </div>
                                        <div className="space-y-3">
                                            {todayActivity.map((metric) => (
                                                <div
                                                    key={metric.label}
                                                    className="flex items-center justify-between"
                                                >
                                                    <span className="text-sm">
                                                        {metric.label}
                                                    </span>
                                                    <span className="text-xl font-bold">
                                                        {metric.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="text-muted-foreground text-sm font-medium">
                                            Weekly Trends
                                        </div>
                                        <div className="space-y-3">
                                            {weeklyTrends.map((metric) => (
                                                <div
                                                    key={metric.label}
                                                    className="flex items-center justify-between"
                                                >
                                                    <span className="text-sm">
                                                        {metric.label}
                                                    </span>
                                                    <span className="text-xl font-bold">
                                                        {metric.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 border-t pt-4">
                                    <div className="text-muted-foreground text-sm font-medium">
                                        Mastery Progress
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span>Completion Rate</span>
                                                <span className="font-medium">
                                                    {formatPercentage(
                                                        flashcardStats?.completionRate,
                                                        isStatsLoading,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="bg-secondary h-2 rounded-full">
                                                <div
                                                    className="h-2 rounded-full bg-green-500 transition-all"
                                                    style={{
                                                        width: `${completionRatePercent}%`,
                                                    }}
                                                />
                                            </div>
                                            <p className="text-muted-foreground mt-2 text-xs">
                                                {formatPercentageChange(
                                                    flashcardStats?.completionRateDifference,
                                                    isStatsLoading,
                                                )}{' '}
                                                vs last period
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="lg:col-span-1">
                            <CompletionRateChart
                                data={completionRateData ?? []}
                                isLoading={isCompletionLoading}
                                year={completionYear}
                                onYearChange={setCompletionYear}
                                error={completionErrorMessage}
                            />
                        </div>
                    </div>

                    <TopDecksChart />
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Flashcards</CardTitle>
                            <CardDescription>
                                All flashcards created by users
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FlashcardTable />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
