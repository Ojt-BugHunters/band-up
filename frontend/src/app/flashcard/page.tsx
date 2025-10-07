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
    Clock,
    FileText,
    Search,
    User,
    BookOpenCheck,
    Plus,
    ClipboardX,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import FlashcardCard from '@/components/flash-card';
import { PaginationState } from '@tanstack/react-table';
import { PaginationControl } from '@/components/ui/pagination-control';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useFlashcardDecks } from '@/hooks/use-flashcard-decks';
import LiquidLoading from '@/components/ui/liquid-loader';
import { EmptyState } from '@/components/ui/empty-state';
import { NotFound } from '@/components/not-found';

export default function FlashcardPage() {
    const [search, setSearch] = useState('');
    const [visibility, setVisibility] = useState<string>('all');
    const [pagination, setPagination] = useState<PaginationState>({
        pageSize: 8,
        pageIndex: 0,
    });
    const { data: flashcards = [], isLoading, isError } = useFlashcardDecks();

    const filteredFlashcards = useMemo(() => {
        return flashcards.filter((card) => {
            const matchesSearch = card.title
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchesVisibility =
                visibility === 'all' ||
                (visibility === 'public' && card.is_public) ||
                (visibility === 'private' && !card.is_public);
            return matchesSearch && matchesVisibility;
        });
    }, [flashcards, search, visibility]);

    const paginatedFlashcards = useMemo(() => {
        const start = pagination.pageIndex * pagination.pageSize;
        const end = start + pagination.pageSize;
        return filteredFlashcards.slice(start, end);
    }, [filteredFlashcards, pagination]);

    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            pageIndex: 0,
        }));
    }, [search, visibility, flashcards.length]);

    if (isLoading)
        return (
            <div className="bg-background flex min-h-screen w-full items-center justify-center rounded-lg border p-4">
                <LiquidLoading />
            </div>
        );
    if (isError) return <NotFound />;

    return (
        <div className="flex-1 space-y-6 p-6">
            <Hero>
                <HeroSummary color="rose">
                    <BookOpenCheck className="mr-2 h-4 w-4" />
                    Study Smarter
                </HeroSummary>
                <HeroTitle>
                    Flashcard
                    <HeroKeyword color="green">Library</HeroKeyword>
                </HeroTitle>
                <HeroDescription>
                    Learn and revise anytime with curated flashcard decks you
                    can make public or keep private.
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
                    <StatsDescription>Flashcard sets by topic</StatsDescription>
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
                    <StatsValue>2</StatsValue>
                    <StatsLabel>Visibility</StatsLabel>
                    <StatsDescription>Public or Private</StatsDescription>
                </Stats>
            </StatsGrid>

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

                    <Select
                        value={visibility}
                        onValueChange={(val) => setVisibility(val)}
                    >
                        <SelectTrigger className="w-[160px] rounded-lg border-slate-200 focus:ring-blue-200">
                            <SelectValue placeholder="Filter by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                    </Select>
                    <Link href="/flashcard/new">
                        <Button className="cursor-pointer rounded-xl bg-blue-600 font-medium text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Deck
                        </Button>
                    </Link>
                </div>
            </div>

            <div>
                {paginatedFlashcards.length === 0 ? (
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
                        {paginatedFlashcards.map((card) => (
                            <FlashcardCard key={card.id} card={card} />
                        ))}
                    </div>
                )}
            </div>

            <div className="mx-auto max-w-7xl">
                <PaginationControl
                    className="mt-6"
                    itemCount={filteredFlashcards.length}
                    pagination={pagination}
                    setPagination={setPagination}
                />
            </div>
        </div>
    );
}
