'use client';
import { useMemo, useState } from 'react';
import { StatCard } from '@/components/admin-stats-card';
import PostsManagementCard from '@/components/posts-management-card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useGetBlogStats, useGetBlogs } from '@/lib/service/blog';
import type { StatsInterval } from '@/lib/service/blog';
import { Eye, FileText, MessageCircle, Timer } from 'lucide-react';

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

const STATS_INTERVAL_OPTIONS: Array<{
    label: string;
    value: StatsInterval;
    periodLabel: string;
}> = [
    { label: 'Daily', value: 'DAILY', periodLabel: 'day' },
    { label: 'Weekly', value: 'WEEKLY', periodLabel: 'week' },
    { label: 'Monthly', value: 'MONTHLY', periodLabel: 'month' },
    { label: 'Yearly', value: 'YEARLY', periodLabel: 'year' },
];

const formatMetricValue = (
    value: number | undefined,
    {
        decimals = 0,
        suffix = '',
        compact = false,
        loading = false,
        stripTrailingZeros = false,
    }: {
        decimals?: number;
        suffix?: string;
        compact?: boolean;
        loading?: boolean;
        stripTrailingZeros?: boolean;
    } = {},
) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
        return loading ? 'Loading…' : '—';
    }

    let formatted = compact
        ? compactNumberFormatter.format(value)
        : value.toLocaleString('en-US', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
          });

    if (stripTrailingZeros && !compact && decimals > 0) {
        formatted = formatted
            .replace(/\.0+$/, '')
            .replace(/(\.\d*?[1-9])0+$/, '$1');
    }

    return suffix ? `${formatted} ${suffix}` : formatted;
};

const formatTrendValue = (
    value: number | undefined,
    {
        decimals = 0,
        suffix = '',
        loading = false,
    }: {
        decimals?: number;
        suffix?: string;
        loading?: boolean;
    } = {},
) => {
    if (loading) return 'Updating...';
    if (value === undefined || value === null || Number.isNaN(value)) {
        return 'No change';
    }
    if (value === 0) return 'No change';

    const formatted = Math.abs(value).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    return `${value > 0 ? '+' : '-'}${formatted}${suffix}`;
};

const isPositiveTrend = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
        return true;
    }
    if (value === 0) return true;
    return value > 0;
};

export default function AdminBlogPage() {
    const [statsInterval, setStatsInterval] = useState<StatsInterval>('WEEKLY');
    const {
        data: blogStats,
        isLoading: isLoadingStats,
        isFetching: isFetchingStats,
        error: statsError,
    } = useGetBlogStats(statsInterval);
    const postsManagementPagination = useMemo(
        () => ({ pageNo: 0, pageSize: 20, ascending: false }),
        [],
    );
    const {
        data: postsManagementData,
        isLoading: isLoadingPostsManagement,
        error: postsManagementError,
    } = useGetBlogs(postsManagementPagination);
    const postsManagement = useMemo(() => {
        if (!postsManagementData?.content) {
            return undefined;
        }
        return [...postsManagementData.content].sort((a, b) => {
            const aTime = new Date(a.publishedDate ?? '').getTime();
            const bTime = new Date(b.publishedDate ?? '').getTime();
            return isNaN(bTime) || isNaN(aTime) ? 0 : bTime - aTime;
        });
    }, [postsManagementData?.content]);
    const isStatsLoading = isLoadingStats || isFetchingStats;
    const statsErrorMessage =
        statsError && statsError instanceof Error
            ? statsError.message
            : undefined;
    const postsManagementErrorMessage =
        postsManagementError && postsManagementError instanceof Error
            ? postsManagementError.message
            : undefined;
    const overviewCards = [
        {
            title: 'Total Views',
            value: formatMetricValue(blogStats?.totalViews, {
                compact: true,
                loading: isStatsLoading,
            }),
            change: formatTrendValue(blogStats?.totalViewsDifference, {
                loading: isStatsLoading,
            }),
            icon: Eye,
            isPositive: isPositiveTrend(blogStats?.totalViewsDifference),
        },
        {
            title: 'Total Posts',
            value: formatMetricValue(blogStats?.totalBlogs, {
                loading: isStatsLoading,
            }),
            change: formatTrendValue(blogStats?.totalBlogsDifference, {
                loading: isStatsLoading,
                suffix: ' posts',
            }),
            icon: FileText,
            isPositive: isPositiveTrend(blogStats?.totalBlogsDifference),
        },
        {
            title: 'Avg. Engagement',
            value: formatMetricValue(blogStats?.avgEngagement, {
                decimals: 1,
                suffix: 'per post',
                loading: isStatsLoading,
                stripTrailingZeros: true,
            }),
            change: formatTrendValue(blogStats?.avgEngagementDifference, {
                loading: isStatsLoading,
                decimals: 1,
                suffix: ' per post',
            }),
            icon: MessageCircle,
            isPositive: isPositiveTrend(blogStats?.avgEngagementDifference),
        },
        {
            title: 'Avg. Read Time',
            value: formatMetricValue(blogStats?.avgReadTime, {
                decimals: 1,
                suffix: 'min',
                loading: isStatsLoading,
            }),
            change: formatTrendValue(blogStats?.avgReadTimeDifference, {
                loading: isStatsLoading,
                decimals: 1,
                suffix: ' min',
            }),
            icon: Timer,
            isPositive: isPositiveTrend(blogStats?.avgReadTimeDifference),
        },
    ];

    return (
        <div className="bg-background min-h-screen p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-foreground mb-2 text-3xl font-bold">
                            Blog Analytics
                        </h1>
                        <p className="text-muted-foreground">
                            Track your blogs performance and engagement metrics
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                        <div className="flex items-center gap-3">
                            <span className="text-muted-foreground text-sm">
                                Stats interval
                            </span>
                            <Select
                                value={statsInterval}
                                onValueChange={(value) =>
                                    setStatsInterval(value as StatsInterval)
                                }
                            >
                                <SelectTrigger className="border-border/60 bg-background w-[140px]">
                                    <SelectValue placeholder="Interval" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                    {STATS_INTERVAL_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {statsErrorMessage && (
                            <p className="text-destructive text-xs">
                                {statsErrorMessage}
                            </p>
                        )}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {overviewCards.map((card) => (
                        <StatCard key={card.title} {...card} />
                    ))}
                </div>

                <PostsManagementCard
                    posts={postsManagement}
                    isLoading={isLoadingPostsManagement}
                    errorMessage={postsManagementErrorMessage}
                />
            </div>
        </div>
    );
}
