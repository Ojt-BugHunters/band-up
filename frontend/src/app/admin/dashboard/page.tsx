'use client';

import { StatCard } from '@/components/admin-stats-card';
import { useGetRoomStats } from '@/lib/service/room';
import { useGetBlogStats } from '@/lib/service/blog';
import { useGetFlashcardStats } from '@/lib/service/flashcard';
import {
    Activity,
    BookOpenCheck,
    MessagesSquare,
    PenSquare,
    Sparkles,
    Users,
} from 'lucide-react';

const numberFormatter = new Intl.NumberFormat('en-US');

const formatStatValue = (value?: number, loading?: boolean) => {
    if (loading) return 'Loading...';
    if (value === undefined || value === null || Number.isNaN(value)) {
        return '—';
    }
    return numberFormatter.format(value);
};

const formatStatChange = (difference?: number, loading?: boolean) => {
    if (loading) return 'Updating';
    if (
        difference === undefined ||
        difference === null ||
        Number.isNaN(difference)
    ) {
        return 'No data';
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

const formatMinutes = (value?: number, loading?: boolean) => {
    if (loading) return 'Loading...';
    if (value === undefined || value === null || Number.isNaN(value)) {
        return '—';
    }
    return `${value} min`;
};

const formatPercentage = (value?: number, loading?: boolean) => {
    if (loading) return 'Loading...';
    if (value === undefined || value === null || Number.isNaN(value)) {
        return '—';
    }
    return `${value.toFixed(1)}%`;
};

const actionItems = [
    {
        title: 'Launch Pomodoro Sprint campaign',
        description: 'Activate public rooms for July cohorts',
        status: 'Live',
        owner: 'Marketing',
    },
    {
        title: 'Publish Speaking band 7+ blog',
        description: 'Finalize outline and hero illustrations',
        status: 'In prep',
        owner: 'Content',
    },
    {
        title: 'Curate new flashcard deck',
        description: 'Select 50 high-frequency collocations',
        status: '60% done',
        owner: 'Flashcard',
    },
];

export default function AdminDashboardGeneral() {
    const {
        data: roomStats,
        isLoading: isLoadingRoomStats,
        isFetching: isFetchingRoomStats,
        error: roomStatsError,
    } = useGetRoomStats('WEEKLY');
    const {
        data: blogStats,
        isLoading: isLoadingBlogStats,
        isFetching: isFetchingBlogStats,
        error: blogStatsError,
    } = useGetBlogStats('WEEKLY');
    const {
        data: flashcardStats,
        isLoading: isLoadingFlashStats,
        isFetching: isFetchingFlashStats,
        error: flashcardStatsError,
    } = useGetFlashcardStats();

    const isRoomLoading = isLoadingRoomStats || isFetchingRoomStats;
    const isBlogLoading = isLoadingBlogStats || isFetchingBlogStats;
    const isFlashLoading = isLoadingFlashStats || isFetchingFlashStats;

    const roomStatsErrorMessage =
        roomStatsError instanceof Error ? roomStatsError.message : undefined;
    const blogStatsErrorMessage =
        blogStatsError instanceof Error ? blogStatsError.message : undefined;
    const flashStatsErrorMessage =
        flashcardStatsError instanceof Error
            ? flashcardStatsError.message
            : undefined;

    const heroHighlights = [
        {
            label: 'Active Rooms',
            value: formatStatValue(roomStats?.totalRooms, isRoomLoading),
            description: 'rooms active this week',
        },
        {
            label: 'Blog Views',
            value: formatStatValue(blogStats?.totalViews, isBlogLoading),
            description: 'weekly reads',
        },
        {
            label: 'Flashcards',
            value: formatStatValue(flashcardStats?.totalCards, isFlashLoading),
            description: 'flashcards published',
        },
        {
            label: 'Learners',
            value: formatStatValue(
                flashcardStats?.totalLearners,
                isFlashLoading,
            ),
            description: 'engaged learners',
        },
    ];

    const statCards = [
        {
            title: 'Rooms',
            value: formatStatValue(roomStats?.totalRooms, isRoomLoading),
            change: formatStatChange(
                roomStats?.totalRoomsDifference,
                isRoomLoading,
            ),
            icon: MessagesSquare,
            isPositive: isPositiveTrend(roomStats?.totalRoomsDifference),
        },
        {
            title: 'Blog Views',
            value: formatStatValue(blogStats?.totalViews, isBlogLoading),
            change: formatStatChange(
                blogStats?.totalViewsDifference,
                isBlogLoading,
            ),
            icon: PenSquare,
            isPositive: isPositiveTrend(blogStats?.totalViewsDifference),
        },
        {
            title: 'Avg Engagement',
            value: formatPercentage(blogStats?.avgEngagement, isBlogLoading),
            change: formatStatChange(
                blogStats?.avgEngagementDifference,
                isBlogLoading,
            ),
            icon: Activity,
            isPositive: isPositiveTrend(blogStats?.avgEngagementDifference),
        },
        {
            title: 'Flashcard Learners',
            value: formatStatValue(
                flashcardStats?.totalLearners,
                isFlashLoading,
            ),
            change: formatStatChange(undefined, isFlashLoading),
            icon: BookOpenCheck,
            isPositive: true,
        },
    ];

    const insightCards = [
        {
            title: 'Avg Read Time',
            metric: formatMinutes(blogStats?.avgReadTime, isBlogLoading),
            helper: 'average read duration per article',
            trend: formatStatChange(
                blogStats?.avgReadTimeDifference,
                isBlogLoading,
            ),
            positive: isPositiveTrend(blogStats?.avgReadTimeDifference),
            gradient: 'from-fuchsia-500 via-rose-500 to-orange-400',
        },
        {
            title: 'Engagement Quality',
            metric: formatPercentage(blogStats?.avgEngagement, isBlogLoading),
            helper: 'average engagement per content piece',
            trend: formatStatChange(
                blogStats?.avgEngagementDifference,
                isBlogLoading,
            ),
            positive: isPositiveTrend(blogStats?.avgEngagementDifference),
            gradient: 'from-sky-500 via-indigo-500 to-purple-500',
        },
        {
            title: 'Decks Published',
            metric: formatStatValue(flashcardStats?.totalDecks, isFlashLoading),
            helper: 'decks serving learners',
            trend: 'Syncing soon',
            positive: true,
            gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
        },
    ];

    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 text-white shadow-2xl">
                <div className="pointer-events-none absolute inset-0 opacity-40">
                    <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white/40 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-amber-300/40 blur-3xl" />
                </div>
                <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center">
                    <div className="space-y-4 lg:w-2/3">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.4em] text-white/70 uppercase">
                            <Sparkles className="h-4 w-4" />
                            Admin Dashboard
                        </div>
                        <h1 className="text-3xl leading-tight font-semibold lg:text-4xl">
                            BandUp executive snapshot
                        </h1>
                        <p className="max-w-2xl text-base text-white/80">
                            Keep rooms, blog content, and flashcards under control from one command center.
                            Track this week&apos;s performance and react instantly.
                        </p>
                    </div>
                    <div className="grid flex-1 gap-4 sm:grid-cols-2">
                        {heroHighlights.map((item) => (
                            <div
                                key={item.label}
                                className="rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur"
                            >
                                <p className="text-xs tracking-wide text-white/70 uppercase">
                                    {item.label}
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {item.value}
                                </p>
                                <p className="text-sm text-white/70">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {(roomStatsErrorMessage ||
                blogStatsErrorMessage ||
                flashStatsErrorMessage) && (
                <div className="text-destructive space-y-2 text-sm">
                    {roomStatsErrorMessage && (
                        <p>
                            Failed to load room stats: {roomStatsErrorMessage}
                        </p>
                    )}
                    {blogStatsErrorMessage && (
                        <p>
                            Failed to load blog stats: {blogStatsErrorMessage}
                        </p>
                    )}
                    {flashStatsErrorMessage && (
                        <p>
                            Failed to load flashcard stats: {flashStatsErrorMessage}
                        </p>
                    )}
                </div>
            )}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                    <StatCard
                        key={card.title}
                        title={card.title}
                        value={card.value}
                        change={card.change}
                        icon={card.icon}
                        isPositive={card.isPositive}
                    />
                ))}
            </section>

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {insightCards.map((insight) => (
                    <div
                        key={insight.title}
                        className={`rounded-3xl bg-gradient-to-r ${insight.gradient} p-5 text-white shadow-lg`}
                    >
                        <p className="text-xs uppercase tracking-wide text-white/80">
                            {insight.title}
                        </p>
                        <p className="mt-3 text-2xl font-semibold">
                            {insight.metric}
                        </p>
                        <p className="text-sm text-white/80">
                            {insight.helper}
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                            <span
                                className={
                                    insight.positive
                                        ? 'text-emerald-100'
                                        : 'text-rose-100'
                                }
                            >
                                {insight.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </section>

            <section>
                <div className="rounded-3xl border border-border/50 bg-card/60 p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-xs tracking-wide uppercase">
                                Team Radar
                            </p>
                            <h2 className="text-xl font-semibold">
                                This week&apos;s priorities
                            </h2>
                        </div>
                        <Users className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div className="mt-6 space-y-5">
                        {actionItems.map((item) => (
                            <div
                                key={item.title}
                                className="border-border/40 rounded-2xl border p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {item.title}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {item.description}
                                        </p>
                                    </div>
                                    <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                                        {item.status}
                                    </span>
                                </div>
                                <p className="text-muted-foreground mt-3 text-xs tracking-wide uppercase">
                                    Owner: {item.owner}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
