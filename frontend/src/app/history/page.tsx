'use client';

import {
    Hero,
    HeroDescription,
    HeroKeyword,
    HeroSummary,
    HeroTitle,
} from '@/components/hero';
import {
    Stats,
    StatsDescription,
    StatsGrid,
    StatsIcon,
    StatsLabel,
    StatsValue,
} from '@/components/stats';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { skills } from '@/lib/service/test';
import { Award, Filter, History, Target, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { PaginationControl } from '@/components/ui/pagination-control';
import { useUser } from '@/lib/service/account';
import { useGetAttemptHistory } from '@/lib/service/attempt';
import LiquidLoading from '@/components/ui/liquid-loader';
import { NotFound } from '@/components/not-found';
import { HistoryCard } from './history-card';

export default function TestHistoryPage() {
    const user = useUser();
    const {
        data: attemptHistory,
        isLoading,
        isError,
    } = useGetAttemptHistory(user?.id as string);

    const totalTests = attemptHistory?.length ?? 0;

    const completedTests =
        attemptHistory?.filter((item) => item.attempt.status === 'ENDED')
            .length ?? 0;

    const totalStudyTime = Math.floor(
        (attemptHistory?.reduce(
            (sum, item) => sum + item.test.durationSeconds,
            0,
        ) ?? 0) / 3600,
    );

    const averageBand = (() => {
        if (!attemptHistory || attemptHistory.length === 0) return 0;

        let sum = 0;
        let count = 0;

        for (const item of attemptHistory) {
            const band = item.attempt.overallBand;
            if (band !== null && band !== undefined) {
                sum += band;
                count++;
            }
        }

        return count > 0 ? sum / count : 0;
    })();

    const bestBand = (() => {
        if (!attemptHistory || attemptHistory.length === 0) return 0;

        let max = -Infinity;
        for (const item of attemptHistory) {
            const band = item.attempt.overallBand;
            if (band !== null && band !== undefined) {
                if (band > max) max = band;
            }
        }
        return max === -Infinity ? 0 : max;
    })();

    const [skill, setSkill] = useState<string | undefined>();
    const [pagination, setPagination] = useState<PaginationState>({
        pageSize: 6,
        pageIndex: 0,
    });

    const filteredTests = useMemo(() => {
        if (!attemptHistory) return [];
        return attemptHistory.filter((item) => {
            if (!skill || skill === 'all') return true;
            return item.test.skillName === skill;
        });
    }, [attemptHistory, skill]);

    const paginationTests = useMemo(() => {
        const start = pagination.pageIndex * pagination.pageSize;
        const end = start + pagination.pageSize;
        return filteredTests.slice(start, end);
    }, [filteredTests, pagination]);

    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            pageIndex: 0,
        }));
    }, [skill]);

    if (isLoading) {
        return (
            <div className="bg-background flex min-h-screen w-full items-center justify-center rounded-lg border p-4">
                <LiquidLoading />
            </div>
        );
    }

    if (isError) {
        return <NotFound />;
    }

    if (!attemptHistory || attemptHistory.length === 0) {
        return (
            <div className="flex min-h-screen flex-1 items-center justify-center p-6">
                <NotFound />
            </div>
        );
    }

    return (
        <div className="min-h-screen space-y-8 p-6">
            <Hero>
                <HeroSummary color="indigo">
                    <History className="mr-2 h-4 w-4" />
                    Your Progress
                </HeroSummary>
                <HeroTitle>
                    Test
                    <HeroKeyword color="purple">History</HeroKeyword>
                </HeroTitle>
                <HeroDescription>
                    Track your progress and review your past test performances
                </HeroDescription>
            </Hero>

            <StatsGrid>
                <Stats className="group relative overflow-hidden transition-all hover:scale-105">
                    <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500/30 to-purple-500/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative">
                        <StatsIcon className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                            <Target />
                        </StatsIcon>
                        <StatsValue>{totalTests}</StatsValue>
                        <StatsLabel>Total Attempts</StatsLabel>
                        <StatsDescription>
                            Tests you&apos;ve taken so far
                        </StatsDescription>
                    </div>
                </Stats>

                <Stats className="group relative overflow-hidden transition-all hover:scale-105">
                    <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-green-500/30 to-emerald-500/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative">
                        <StatsIcon className="bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                            <Award />
                        </StatsIcon>
                        <StatsValue>{completedTests}</StatsValue>
                        <StatsLabel>Completed</StatsLabel>
                        <StatsDescription>
                            Successfully finished tests
                        </StatsDescription>
                    </div>
                </Stats>

                <Stats className="group relative overflow-hidden transition-all hover:scale-105">
                    <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-500/30 to-orange-500/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative">
                        <StatsIcon className="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                            <TrendingUp />
                        </StatsIcon>
                        <StatsValue>{averageBand.toFixed(1)}</StatsValue>
                        <StatsLabel>Average Band</StatsLabel>
                        <StatsDescription>
                            Your overall performance
                        </StatsDescription>
                    </div>
                </Stats>

                <Stats className="group relative overflow-hidden transition-all hover:scale-105">
                    <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-rose-500/30 to-pink-500/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative">
                        <StatsIcon className="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                            <History />
                        </StatsIcon>
                        <StatsValue>
                            {bestBand.toFixed(1)} / {totalStudyTime}h
                        </StatsValue>
                        <StatsLabel>Best Band & Study Time</StatsLabel>
                        <StatsDescription>
                            Your peak score and hours practiced
                        </StatsDescription>
                    </div>
                </Stats>
            </StatsGrid>

            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-2xl font-bold">Recent Tests</h2>
                    <Select value={skill} onValueChange={setSkill}>
                        <SelectTrigger className="w-fit border-slate-200">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter by skill" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key="all" value="all">
                                All Skills
                            </SelectItem>
                            {skills.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {paginationTests.map((item) => (
                        <HistoryCard key={item.attempt.id} item={item} />
                    ))}
                </div>

                <PaginationControl
                    className="mt-6"
                    itemCount={filteredTests.length}
                    pagination={pagination}
                    setPagination={setPagination}
                />
            </div>
        </div>
    );
}
