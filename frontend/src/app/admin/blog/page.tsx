'use client';
import { useMemo, useState } from 'react';
import StatCard from '@/components/stat-card';
import RecentPostsCard from '@/components/recent-posts-card';
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

const formatChangeText = (
    value: number | undefined,
    periodLabel: string,
    {
        decimals = 0,
        unit = '',
        loading = false,
    }: {
        decimals?: number;
        unit?: string;
        loading?: boolean;
    } = {},
) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
        return loading ? 'Updating…' : `vs last ${periodLabel} —`;
    }

    const formatted = value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    const prefix = value > 0 ? '+' : value < 0 ? '' : '';
    const unitText = unit ? ` ${unit}` : '';
    return `${prefix}${formatted}${unitText} vs last ${periodLabel}`;
};

export default function AdminBlogPage() {
    const [statsInterval, setStatsInterval] = useState<StatsInterval>('WEEKLY');
    const {
        data: blogStats,
        isLoading: isLoadingStats,
        isFetching: isFetchingStats,
        error: statsError,
    } = useGetBlogStats(statsInterval);
    const recentPostsPagination = useMemo(
        () => ({ pageNo: 0, pageSize: 5, ascending: false }),
        [],
    );
    const {
        data: recentPostsData,
        isLoading: isLoadingRecentPosts,
        error: recentPostsError,
    } = useGetBlogs(recentPostsPagination);
    const postsManagementPagination = useMemo(
        () => ({ pageNo: 0, pageSize: 20, ascending: false }),
        [],
    );
    const {
        data: postsManagementData,
        isLoading: isLoadingPostsManagement,
        error: postsManagementError,
    } = useGetBlogs(postsManagementPagination);
    const recentPosts = useMemo(() => {
        if (!recentPostsData?.content) {
            return undefined;
        }
        return [...recentPostsData.content].sort((a, b) => {
            const aTime = new Date(a.publishedDate ?? '').getTime();
            const bTime = new Date(b.publishedDate ?? '').getTime();
            return isNaN(bTime) || isNaN(aTime) ? 0 : bTime - aTime;
        });
    }, [recentPostsData?.content]);
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
    const statsPeriodLabel =
        STATS_INTERVAL_OPTIONS.find((option) => option.value === statsInterval)
            ?.periodLabel ?? 'period';
    const isStatsLoading = isLoadingStats || isFetchingStats;
    const statsErrorMessage =
        statsError && statsError instanceof Error
            ? statsError.message
            : undefined;
    const recentPostsErrorMessage =
        recentPostsError && recentPostsError instanceof Error
            ? recentPostsError.message
            : undefined;
    const postsManagementErrorMessage =
        postsManagementError && postsManagementError instanceof Error
            ? postsManagementError.message
            : undefined;

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
                    <StatCard
                        title="Total Views"
                        value={formatMetricValue(blogStats?.totalViews, {
                            compact: true,
                            loading: isStatsLoading,
                        })}
                        change={formatChangeText(
                            blogStats?.totalViewsDifference,
                            statsPeriodLabel,
                            { loading: isStatsLoading },
                        )}
                        icon="📊"
                    />
                    <StatCard
                        title="Total Posts"
                        value={formatMetricValue(blogStats?.totalBlogs, {
                            loading: isStatsLoading,
                        })}
                        change={formatChangeText(
                            blogStats?.totalBlogsDifference,
                            statsPeriodLabel,
                            {
                                loading: isStatsLoading,
                                unit: 'posts',
                            },
                        )}
                        icon="📝"
                    />
                    <StatCard
                        title="Avg. Engagement"
                        value={formatMetricValue(blogStats?.avgEngagement, {
                            decimals: 1,
                            suffix: 'per post',
                            loading: isStatsLoading,
                            stripTrailingZeros: true,
                        })}
                        change={formatChangeText(
                            blogStats?.avgEngagementDifference,
                            statsPeriodLabel,
                            {
                                decimals: 1,
                                unit: 'per post',
                                loading: isStatsLoading,
                            },
                        )}
                        icon="💬"
                    />
                    <StatCard
                        title="Avg. Read Time"
                        value={formatMetricValue(blogStats?.avgReadTime, {
                            decimals: 1,
                            suffix: 'min',
                            loading: isStatsLoading,
                        })}
                        change={formatChangeText(
                            blogStats?.avgReadTimeDifference,
                            statsPeriodLabel,
                            {
                                decimals: 1,
                                unit: 'min',
                                loading: isStatsLoading,
                            },
                        )}
                        icon="⏱️"
                    />
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Recent Posts - Left side */}
                    <RecentPostsCard
                        posts={recentPosts}
                        isLoading={isLoadingRecentPosts}
                        errorMessage={recentPostsErrorMessage}
                        className="lg:col-span-3"
                    />

                    {/* Top Posts - Right side */}
                    {/* <TopPostsCard posts={topPosts} className="lg:col-span-1" /> */}

                    {/* Posts Management Card with tabs */}
                    <PostsManagementCard
                        posts={postsManagement}
                        isLoading={isLoadingPostsManagement}
                        errorMessage={postsManagementErrorMessage}
                    />
                </div>
            </div>
        </div>
    );
}
