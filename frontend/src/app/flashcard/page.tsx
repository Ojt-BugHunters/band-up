'use client';

import FlashcardCard from './flash-card';
import {
    Hero,
    HeroDescription,
    HeroKeyword,
    HeroSummary,
    HeroTitle,
} from '@/components/hero';
import { NotFound } from '@/components/not-found';
import {
    Stats,
    StatsDescription,
    StatsGrid,
    StatsIcon,
    StatsLabel,
    StatsValue,
} from '@/components/stats';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import LiquidLoading from '@/components/ui/liquid-loader';
import { PaginationControl } from '@/components/ui/pagination-control';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useGetFlashcardStats, useGetDecks } from '@/lib/service/flashcard';
import { useUser } from '@/lib/service/account';
import { PaginationState } from '@tanstack/react-table';
import {
    BookOpenCheck,
    ClipboardX,
    Clock,
    FileText,
    Plus,
    Search,
    User,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@/lib/utils-client';
import CreateFlashcardDialog from './create-flashcard-dialog';

export default function FlashcardPage() {
    const [search, setSearch] = useState('');
    const [visibility, setVisibility] = useState<string>('all');
    const [isLearn, setIsLearn] = useState(false);
    const [pagination, setPagination] = useState<PaginationState>({
        pageSize: 8,
        pageIndex: 0,
    });
    const user = useUser();
    const debouncedSearch = useDebounce(search, 400);
    const apiPaging = useMemo(
        () => ({
            pageNo: pagination.pageIndex,
            pageSize: pagination.pageSize,
            sortBy: 'learnerNumber',
            ascending: false,
            queryBy: debouncedSearch.trim() || '',
            visibility: (visibility === 'all' ? '' : visibility) as
                | ''
                | 'public'
                | 'private',
            isLearned: isLearn,
        }),
        [
            pagination.pageIndex,
            pagination.pageSize,
            visibility,
            debouncedSearch,
            isLearn,
        ],
    );

    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [search, visibility]);

    const { data, isPending, isError } = useGetDecks(apiPaging);
    const { data: stats } = useGetFlashcardStats();
    const filteredFlashcards = useMemo(() => {
        return data?.content.filter((deck) => {
            const matchesSearch = deck.title
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchesVisibility =
                visibility === 'all' ||
                (visibility === 'public' && deck.public) ||
                (visibility === 'private' && !deck.public);
            return matchesSearch && matchesVisibility;
        });
    }, [data, search, visibility]);

    const isInitial = isPending && !data;
    if (isInitial) {
        return (
            <div className="bg-background flex min-h-screen w-full items-center justify-center rounded-lg border p-4">
                <LiquidLoading />
            </div>
        );
    }
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
                    <StatsValue>{stats?.totalCards}</StatsValue>
                    <StatsLabel>Total Flashcards</StatsLabel>
                    <StatsDescription>
                        Cards available to review
                    </StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-green-50 text-green-600">
                        <FileText />
                    </StatsIcon>
                    <StatsValue>{stats?.totalDecks}</StatsValue>
                    <StatsLabel>Total Decks</StatsLabel>
                    <StatsDescription>Flashcard sets by topic</StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-rose-50 text-rose-600">
                        <User />
                    </StatsIcon>
                    <StatsValue>{stats?.totalLearners}</StatsValue>
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
                    {user && (
                        <Select
                            value={String(isLearn)}
                            onValueChange={(val) => setIsLearn(val === 'true')}
                        >
                            <SelectTrigger className="w-[160px] rounded-lg border-slate-200 focus:ring-blue-200">
                                <SelectValue placeholder="Learnt" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Learnt</SelectItem>
                                <SelectItem value="false">
                                    Not Learnt
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                    <CreateFlashcardDialog />
                </div>
            </div>

            <div>
                {filteredFlashcards?.length === 0 ? (
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
                        {filteredFlashcards?.map((card) => (
                            <FlashcardCard key={card.id} card={card} />
                        ))}
                    </div>
                )}
            </div>

            <div className="mx-auto max-w-7xl">
                <PaginationControl
                    className="mt-6"
                    itemCount={data?.totalElements ?? 0}
                    pagination={pagination}
                    setPagination={setPagination}
                />
            </div>
        </div>
    );
}
