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
import {
    Clock,
    FileText,
    Filter,
    Search,
    SortDesc,
    User,
    BookOpenCheck,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { mockFlashcards } from '../../../constants/sample-data';
import FlashcardCard from '@/components/flash-card';
import FlashcardPlayer from '@/components/flashcard-player';
import { PaginationState } from '@tanstack/react-table';
import { PaginationControl } from '@/components/ui/pagination-control';
import { skills } from '@/lib/api/dto/flashcards';

export default function FlashcardPage() {
    const [skill, setSkill] = useState<string | undefined>();
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<string | undefined>();
    const [pagination, setPagination] = useState<PaginationState>({
        pageSize: 8,
        pageIndex: 0,
    });

    const skillFilteredFlashcards = useMemo(() => {
        if (skill && skill !== 'all') {
            return mockFlashcards.filter((card) => card.skill === skill);
        }
        return mockFlashcards;
    }, [skill]);

    const searchFilteredFlashcards = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return skillFilteredFlashcards;
        }

        return skillFilteredFlashcards.filter((card) =>
            [card.title, card.term, card.definition].some((value) =>
                value.toLowerCase().includes(query),
            ),
        );
    }, [search, skillFilteredFlashcards]);

    const applySort = useCallback(
        (cards: typeof mockFlashcards) => {
            if (!sort) return cards;

            return [...cards].sort((a, b) => {
                if (sort === 'latest') {
                    return (
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    );
                }
                if (sort === 'oldest') {
                    return (
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                    );
                }
                return 0;
            });
        },
        [sort],
    );

    const sortedPlayerFlashcards = useMemo(
        () => applySort(skillFilteredFlashcards),
        [applySort, skillFilteredFlashcards],
    );

    const sortedGridFlashcards = useMemo(
        () => applySort(searchFilteredFlashcards),
        [applySort, searchFilteredFlashcards],
    );

    const paginatedFlashcards = useMemo(() => {
        const start = pagination.pageIndex * pagination.pageSize;
        const end = start + pagination.pageSize;
        return sortedGridFlashcards.slice(start, end);
    }, [sortedGridFlashcards, pagination]);

    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            pageIndex: 0,
        }));
    }, [search, skill, sort]);

    return (
        <div className="flex-1 space-y-6 p-6">
            <Hero>
                <HeroSummary color="rose">
                    <BookOpenCheck className="mr-2 h-4 w-4" />
                    Study Smarter
                </HeroSummary>
                <HeroTitle>
                    Flashcard
                    <HeroKeyword color="blue">Library</HeroKeyword>
                </HeroTitle>
                <HeroDescription>
                    Learn and revise anytime with curated flashcard decks across
                    all IELTS skills.
                </HeroDescription>
            </Hero>

            <StatsGrid>
                <Stats>
                    <StatsIcon className="bg-indigo-50 text-indigo-600">
                        <BookOpenCheck />
                    </StatsIcon>
                    <StatsValue>3200</StatsValue>
                    <StatsLabel>Total Flashcards</StatsLabel>
                    <StatsDescription>
                        Cards available to review
                    </StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-green-50 text-green-600">
                        <FileText />
                    </StatsIcon>
                    <StatsValue>120</StatsValue>
                    <StatsLabel>Total Decks</StatsLabel>
                    <StatsDescription>
                        Flashcard sets by skill/topic
                    </StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-rose-50 text-rose-600">
                        <User />
                    </StatsIcon>
                    <StatsValue>92</StatsValue>
                    <StatsLabel>Total Learners</StatsLabel>
                    <StatsDescription>
                        Active users studying flashcards
                    </StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-yellow-50 text-yellow-600">
                        <Clock />
                    </StatsIcon>
                    <StatsValue>5 mins</StatsValue>
                    <StatsLabel>Avg. Time/Deck</StatsLabel>
                    <StatsDescription>
                        Average time to review a deck
                    </StatsDescription>
                </Stats>
            </StatsGrid>

            <div className="mx-auto max-w-4xl">
                <FlashcardPlayer cards={sortedPlayerFlashcards} />
            </div>

            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by flashcard title..."
                            className="mx-auto rounded-xl border-slate-200 pl-11 focus:border-blue-300 focus:ring-blue-200"
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
                {paginatedFlashcards.map((card) => (
                    <FlashcardCard key={card.id} card={card} />
                ))}
            </div>

            <div className="mx-auto max-w-7xl">
                <PaginationControl
                    className="mt-6"
                    itemCount={sortedGridFlashcards.length}
                    pagination={pagination}
                    setPagination={setPagination}
                />
            </div>
        </div>
    );
}
