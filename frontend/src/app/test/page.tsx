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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { skills } from '@/lib/service/test';
import {
    Clock,
    FileText,
    Filter,
    Search,
    SortDesc,
    User,
    BookOpenCheck,
    BookOpen,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { TestCard } from '@/components/test-card';
import { PaginationState } from '@tanstack/react-table';
import { PaginationControl } from '@/components/ui/pagination-control';
import Link from 'next/link';
import { useGetDictationTests } from '@/lib/service/dictation';
import LiquidLoading from '@/components/ui/liquid-loader';
import { NotFound } from '@/components/not-found';

export default function TestListPage() {
    const [skill, setSkill] = useState<string>('all');
    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState<string | undefined>();
    const [pagination, setPagination] = useState<PaginationState>({
        pageSize: 8,
        pageIndex: 0,
    });
    const { data: tests, isLoading, isError } = useGetDictationTests();

    const filteredTests = useMemo(() => {
        return tests?.filter((test) => {
            const matchesSearch = search
                ? test.title.toLowerCase().includes(search.toLowerCase())
                : true;

            const matchesSkill =
                skill && skill !== 'all' ? test.skillName === skill : true;

            const skillIsNotDictation = test.skillName !== 'Dictation';
            return matchesSearch && matchesSkill && skillIsNotDictation;
        });
    }, [search, skill, tests]);

    const sortedTests = useMemo(() => {
        if (!sort) return filteredTests;

        return [...(filteredTests ?? [])].sort((a, b) => {
            if (sort === 'latest') {
                return (
                    new Date(b.createAt).getTime() -
                    new Date(a.createAt).getTime()
                );
            }
            if (sort === 'oldest') {
                return (
                    new Date(a.createAt).getTime() -
                    new Date(b.createAt).getTime()
                );
            }
            return 0;
        });
    }, [filteredTests, sort]);

    const paginatedTests = useMemo(() => {
        const start = pagination.pageIndex * pagination.pageSize;
        const end = start + pagination.pageSize;
        return sortedTests?.slice(start, end);
    }, [sortedTests, pagination]);

    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            pageIndex: 0,
        }));
    }, [search, skill, sort]);

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

    return (
        <div className="flex-1 space-y-6 p-6">
            <Hero>
                <HeroSummary color="rose">
                    <BookOpenCheck className="mr-2 h-4 w-4" />
                    Join Test Now
                </HeroSummary>
                <HeroTitle>
                    Practice Test
                    <HeroKeyword color="blue">Storage</HeroKeyword>
                </HeroTitle>
                <HeroDescription>
                    Master your IELTS skills with our comprehensive test
                    collection
                </HeroDescription>
            </Hero>

            <StatsGrid>
                <Stats>
                    <StatsIcon className="bg-indigo-50 text-indigo-600">
                        <FileText />
                    </StatsIcon>
                    <StatsValue>150</StatsValue>
                    <StatsLabel>Total Tests</StatsLabel>
                    <StatsDescription>
                        Available practice tests
                    </StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-green-50 text-green-600">
                        <User />
                    </StatsIcon>
                    <StatsValue>92</StatsValue>
                    <StatsLabel>Total Participants</StatsLabel>
                    <StatsDescription>
                        Number of students practicing
                    </StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-rose-50 text-rose-600">
                        <Clock />
                    </StatsIcon>
                    <StatsValue>40</StatsValue>
                    <StatsLabel>mins Taken</StatsLabel>
                    <StatsDescription>
                        Avarage time taken for one test to complete
                    </StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-yellow-50 text-yellow-600">
                        <BookOpen />
                    </StatsIcon>
                    <StatsValue>4</StatsValue>
                    <StatsLabel>Skills Coverd</StatsLabel>
                    <StatsDescription>
                        Reading, Listening, Speaking, Writing
                    </StatsDescription>
                </Stats>
            </StatsGrid>

            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by test title..."
                            className="mx-auto rounded-xl border-slate-200 pl-11 focus:border-rose-300 focus:ring-rose-200"
                        />
                    </div>
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

                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="w-fil border-slate-200">
                            <SortDesc className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key="latest" value="latest">
                                Latest
                            </SelectItem>
                            <SelectItem key="oldest" value="oldest">
                                Oldest
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="mx-auto mb-12 grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {paginatedTests?.map((test) => (
                    <Link
                        key={test.id}
                        href={`/test/${test.skillName.toLowerCase()}/${test.id}`}
                    >
                        <TestCard test={test} />
                    </Link>
                ))}
            </div>
            <div className="mx-auto max-w-7xl">
                <PaginationControl
                    className="mt-6"
                    itemCount={sortedTests?.length ?? 0}
                    pagination={pagination}
                    setPagination={setPagination}
                />
            </div>
        </div>
    );
}
