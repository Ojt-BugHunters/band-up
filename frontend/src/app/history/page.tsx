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
import TestHistoryGrid from '@/components/test-history-grid';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { skills } from '@/lib/service/test';
import {
    Award,
    Calendar,
    Filter,
    History,
    Target,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { testHistory } from '../../../constants/sample-data';
import { PaginationState } from '@tanstack/react-table';
import { PaginationControl } from '@/components/ui/pagination-control';

export default function TestHistory() {
    const [skill, setSkill] = useState<string | undefined>();
    const [pagination, setPagination] = useState<PaginationState>({
        pageSize: 6,
        pageIndex: 0,
    });

    const filteredTests = useMemo(() => {
        return testHistory.filter((test) => {
            const matchesSkill =
                skill && skill !== 'all' ? test.skill === skill : true;
            return matchesSkill;
        });
    }, [skill]);

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

    return (
        <div className="flex-1 space-y-6 p-6">
            <Hero>
                <HeroSummary color="yellow">
                    <History className="mr-2 h-4 w-4" />
                    Review Test
                </HeroSummary>
                <HeroTitle>
                    Tracked Test
                    <HeroKeyword color="green">Done</HeroKeyword>
                </HeroTitle>
                <HeroDescription>
                    Manage the test that you have done to see your brilliant
                    progress
                </HeroDescription>
            </Hero>

            <StatsGrid>
                <Stats>
                    <StatsIcon className="bg-indigo-50 text-indigo-600">
                        <Award />
                    </StatsIcon>
                    <StatsValue>7.0</StatsValue>
                    <StatsLabel>Average Score</StatsLabel>
                    <StatsDescription>Score between test</StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-green-50 text-green-600">
                        <Target />
                    </StatsIcon>
                    <StatsValue>9.0</StatsValue>
                    <StatsLabel>Highest Score</StatsLabel>
                    <StatsDescription>
                        Highest Score of all test
                    </StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-rose-50 text-rose-600">
                        <Calendar />
                    </StatsIcon>
                    <StatsValue>3</StatsValue>
                    <StatsLabel>Tests</StatsLabel>
                    <StatsDescription>Total test taken</StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-yellow-50 text-yellow-600">
                        <TrendingUp />
                    </StatsIcon>
                    <StatsValue>+0.5</StatsValue>
                    <StatsLabel>Improvement</StatsLabel>
                    <StatsDescription>
                        Your own improvement so far
                    </StatsDescription>
                </Stats>
            </StatsGrid>
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                    <Select value={skill} onValueChange={setSkill}>
                        <SelectTrigger className="w-fit border-slate-200">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter by skill" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key="all" value="all">
                                All Skills
                            </SelectItem>
                            {skills.map((skill) => (
                                <SelectItem key={skill} value={skill}>
                                    {skill}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <TestHistoryGrid testHistory={paginationTests} />
            </div>
            <div className="mx-auto max-w-7xl">
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
