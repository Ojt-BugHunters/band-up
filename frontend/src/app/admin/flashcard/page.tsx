'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyLearnersChart } from './daily-learner-chart';
import { TopDecksChart } from './top-deck-chart';
import { FlashcardTable } from './flashcard-table';
import { CompletionRateChart } from './completion-rate-chart';
import { EngagementMetricsChart } from './engagement-metric-chart';
import { StudyTimeChart } from './study-time-chart';
import {
    Brain,
    Users,
    CreditCard,
    Target,
    Clock,
    Zap,
    Award,
    UserPlus,
    Layers,
} from 'lucide-react';
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
    const [statsInterval, setStatsInterval] =
        useState<StatsInterval>('WEEKLY');
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
    const isCompletionLoading =
        isLoadingCompletion || isFetchingCompletion;

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
            value: formatStatValue(
                flashcardStats?.totalCards,
                isStatsLoading,
            ),
            change: formatStatChange(
                flashcardStats?.totalCardsDifference,
                isStatsLoading,
            ),
            icon: CreditCard,
            isPositive: isPositiveTrend(
                flashcardStats?.totalCardsDifference,
            ),
        },
        {
            title: 'Active Decks',
            value: formatStatValue(totalDecksValue, isStatsLoading),
            change: formatStatChange(
                flashcardStats?.activeDecksDifference,
                isStatsLoading,
            ),
            icon: Brain,
            isPositive: isPositiveTrend(
                flashcardStats?.activeDecksDifference,
            ),
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
            value: formatStatValue(
                flashcardStats?.totalCards,
                isStatsLoading,
            ),
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
                <TabsList className="grid w-full max-w-md grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
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
                                    <SelectItem value="DAILY">
                                        Daily
                                    </SelectItem>
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

                    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
                        {/* Overview - Performance - Need to connect API here */}
                        <Card className="md:col-span-2 lg:col-span-4 lg:row-span-2">
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

                        {/* Connect API here */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Clock className="h-4 w-4" />
                                    Peak Hours
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">
                                        Morning (6-12)
                                    </span>
                                    <span className="font-bold">2,340</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">
                                        Afternoon (12-18)
                                    </span>
                                    <span className="font-bold text-green-500">
                                        4,560
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">
                                        Evening (18-24)
                                    </span>
                                    <span className="font-bold">3,120</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">
                                        Night (0-6)
                                    </span>
                                    <span className="font-bold">890</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Award className="h-4 w-4" />
                                    Top Performers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white">
                                            1
                                        </div>
                                        <span className="text-sm">
                                            Sarah Chen
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        98.5%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-xs font-bold text-white">
                                            2
                                        </div>
                                        <span className="text-sm">
                                            Mike Johnson
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        97.2%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                                            3
                                        </div>
                                        <span className="text-sm">
                                            Emma Davis
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        96.8%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                                            4
                                        </div>
                                        <span className="text-sm">
                                            Alex Wilson
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        95.9%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <div className="lg:col-span-4">
                            <CompletionRateChart
                                data={completionRateData ?? []}
                                isLoading={isCompletionLoading}
                                year={completionYear}
                                onYearChange={setCompletionYear}
                                error={completionErrorMessage}
                            />
                        </div>
                        <div className="lg:col-span-3">
                            <StudyTimeChart />
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <EngagementMetricsChart />
                        <Card>
                            <CardHeader>
                                <CardTitle>Retention Rate</CardTitle>
                                <CardDescription>
                                    7-day, 30-day, and 90-day retention
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* TODO: Fill the retention data here */}
                                <div className="space-y-4">
                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                7-Day Retention
                                            </span>
                                            <span className="font-medium">
                                                82%
                                            </span>
                                        </div>
                                        <div className="bg-secondary h-2 rounded-full">
                                            <div
                                                className="bg-primary h-2 rounded-full"
                                                style={{ width: '82%' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                30-Day Retention
                                            </span>
                                            <span className="font-medium">
                                                64%
                                            </span>
                                        </div>
                                        <div className="bg-secondary h-2 rounded-full">
                                            <div
                                                className="bg-chart-2 h-2 rounded-full"
                                                style={{ width: '64%' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                90-Day Retention
                                            </span>
                                            <span className="font-medium">
                                                48%
                                            </span>
                                        </div>
                                        <div className="bg-secondary h-2 rounded-full">
                                            <div
                                                className="bg-chart-3 h-2 rounded-full"
                                                style={{ width: '48%' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <TopDecksChart />
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-6">
                    {/* TODO: Connect API Deck - User metric here */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="Active Learners (30d)"
                            value="8,452"
                            change="12.3%"
                            icon={Users}
                            isPositive
                        />
                        <StatCard
                            title="New Learners"
                            value="2,317"
                            change="18.6%"
                            icon={UserPlus}
                            isPositive
                        />
                        <StatCard
                            title="Avg. Deck Engagement"
                            value="2.1 decks/user"
                            change="7.4%"
                            icon={Layers}
                            isPositive
                        />{' '}
                    </div>

                    <DailyLearnersChart />
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
