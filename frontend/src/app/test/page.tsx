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
import { skills } from '@/lib/api/dto/test';
import {
    Clock,
    FileText,
    Filter,
    Loader2,
    Search,
    SortDesc,
    User,
    BookOpenCheck,
} from 'lucide-react';
import { useState } from 'react';

export default function TestListPage() {
    const [skill, setSkill] = useState<string | undefined>();
    const [search, setSearch] = useState<string | undefined>();
    const [sort, setSort] = useState<string | undefined>();
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
                    <StatsValue>48</StatsValue>
                    <StatsLabel>Pending Tests</StatsLabel>
                    <StatsDescription>
                        Number of tests not yet taken
                    </StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-yellow-50 text-yellow-600">
                        <Loader2 />
                    </StatsIcon>
                    <StatsValue>10</StatsValue>
                    <StatsLabel>In-progress Tests</StatsLabel>
                    <StatsDescription>
                        Number of tests in progress
                    </StatsDescription>
                </Stats>
            </StatsGrid>

            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                        <Input
                            value={search}
                            placeholder="Search by test title..."
                            className="mx-auto rounded-xl border-slate-200 pl-11 focus:border-rose-300 focus:ring-rose-200"
                        />
                    </div>
                    <Select value={skill}>
                        <SelectTrigger
                            onReset={() => setSkill(undefined)}
                            value={skill}
                            className="w-fit border-slate-200"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter by skill" />
                        </SelectTrigger>
                        <SelectContent>
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
        </div>
    );
}
