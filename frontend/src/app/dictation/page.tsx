'use client';

import FlashcardCard from '@/components/flash-card';
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
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { PaginationControl } from '@/components/ui/pagination-control';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PaginationState } from '@tanstack/react-table';
import {
    BookOpenCheck,
    ClipboardX,
    Clock,
    FileText,
    Headphones,
    Search,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { mockDictations } from '../../../constants/sample-data';
import DictationCard from '@/components/dictation-card';

export default function FlashcardPage() {
    const [search, setSearch] = useState('');
    const [difficult, setDifficult] = useState<string>('all');
    const [pagination, setPagination] = useState<PaginationState>({
        pageSize: 8,
        pageIndex: 0,
    });

    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [search, difficult]);

    return (
        <div className="flex-1 space-y-6 p-6">
            <Hero>
                <HeroSummary color="rose">
                    <Headphones className="mr-2 h-4 w-4" />
                    Master your Listening Skill
                </HeroSummary>
                <HeroTitle>
                    IELTS Dictation
                    <HeroKeyword color="blue">Practice</HeroKeyword>
                </HeroTitle>
                <HeroDescription>
                    Improve your listening comprehension with authentic IELTS
                    audio materials{' '}
                </HeroDescription>
            </Hero>

            <StatsGrid>
                <Stats>
                    <StatsIcon className="bg-indigo-50 text-indigo-600">
                        <BookOpenCheck />
                    </StatsIcon>
                    <StatsValue>40</StatsValue>
                    <StatsLabel>Total Tests</StatsLabel>
                    <StatsDescription>
                        Test available to practice
                    </StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-green-50 text-green-600">
                        <FileText />
                    </StatsIcon>
                    <StatsValue>30</StatsValue>
                    <StatsLabel>mins</StatsLabel>
                    <StatsDescription>Average Duration</StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-rose-50 text-rose-600">
                        <User />
                    </StatsIcon>
                    <StatsValue>500</StatsValue>
                    <StatsLabel>Total Leaners</StatsLabel>
                    <StatsDescription>Leaners already do test</StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-yellow-50 text-yellow-600">
                        <Clock />
                    </StatsIcon>
                    <StatsValue>3</StatsValue>
                    <StatsLabel>Types</StatsLabel>
                    <StatsDescription>Types of difficulty</StatsDescription>
                </Stats>
            </StatsGrid>

            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by dictation test title..."
                            className="mx-auto rounded-xl border-slate-200 pl-11 focus:border-blue-300 focus:ring-blue-200"
                        />
                    </div>

                    <Select
                        value={difficult}
                        onValueChange={(val) => setDifficult(val)}
                    >
                        <SelectTrigger className="w-[160px] rounded-lg border-slate-200 focus:ring-blue-200">
                            <SelectValue placeholder="Filter by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                {mockDictations?.length === 0 ? (
                    <div className="mx-auto max-w-7xl rounded-md border">
                        <EmptyState
                            className="mx-auto"
                            title="No flashcards found"
                            description="Correct your filter to see if there are flashcards"
                            icons={[ClipboardX]}
                        />
                    </div>
                ) : (
                    <div className="mx-auto mb-12 grid max-w-7xl cursor-pointer grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {mockDictations?.map((dictation) => (
                            <DictationCard
                                key={dictation.id}
                                dictation={dictation}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="mx-auto max-w-7xl">
                <PaginationControl
                    className="mt-6"
                    itemCount={100}
                    pagination={pagination}
                    setPagination={setPagination}
                />
            </div>
        </div>
    );
}
