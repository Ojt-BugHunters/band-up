'use client';

import { use } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    BookOpenCheck,
    GraduationCap,
    ClipboardCheck,
    Settings,
    Edit,
    Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import FlashcardPlayer from '@/components/flashcard-player';
import { AccountPicture } from '@/components/ui/account-picture';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    useFlashcardDeck,
    useFlashcardDeckCards,
} from '@/hooks/use-flashcard-deck';

type FlashcardDetailPageProps = {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ password?: string }>;
};

export default function FlashcardDetailPage({
    params,
    searchParams,
}: FlashcardDetailPageProps) {
    const { id } = use(params);
    const resolvedSearchParams = searchParams ? use(searchParams) : undefined;
    const password = resolvedSearchParams?.password;

    const {
        data: deck,
        isLoading: isDeckLoading,
        isError: isDeckError,
        error: deckError,
    } = useFlashcardDeck(id, password);

    const {
        data: deckCards = [],
        isLoading: isCardsLoading,
        isError: isCardsError,
        error: cardsError,
    } = useFlashcardDeckCards(id, password);

    const isLoading = isDeckLoading || isCardsLoading;
    const isError = isDeckError || isCardsError;

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading deck...
            </div>
        );
    }

    if (isError || !deck) {
        const errorMessage =
            deckError instanceof Error
                ? deckError.message
                : cardsError instanceof Error
                  ? cardsError.message
                  : 'Unable to load deck.';
        return (
            <div className="flex min-h-screen items-center justify-center text-center">
                <div>
                    <p className="text-lg font-semibold text-red-500">
                        {errorMessage}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Please verify the password or try again later.
                    </p>
                </div>
            </div>
        );
    }

    const totalCards = deckCards.length;

    return (
        <div className="mt-20 min-h-screen bg-gray-50 dark:bg-[#0a092d]">
            <div className="bg-white dark:bg-[#0a092d]">
                <div className="mx-auto max-w-7xl px-6 py-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
                                {deck.title}
                            </h1>
                            <div className="mb-4 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8">
                                        <AccountPicture name={deck.author_name} />
                                    </div>
                                    <span className="font-medium dark:text-gray-300">
                                        {deck.author_name}
                                    </span>
                                </div>
                                <span>•</span>
                                <span>
                                    {new Date(deck.created_at).toLocaleDateString()}
                                </span>
                                <span>•</span>
                                <Badge
                                    variant="secondary"
                                    className={
                                        deck.is_public
                                            ? 'border-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'border-0 bg-gray-200 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300'
                                    }
                                >
                                    {deck.is_public ? 'Public' : 'Private'}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="transition-colors dark:border-gray-700 dark:bg-[#2e3856] dark:text-white dark:hover:bg-[#3d4a6b]"
                                    >
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48 dark:border-gray-700 dark:bg-[#2e3856]"
                                >
                                    <DropdownMenuItem
                                        onClick={() =>
                                            console.log('Edit clicked')
                                        }
                                        className="cursor-pointer transition-colors dark:text-white dark:hover:bg-[#3d4a6b] dark:focus:bg-[#3d4a6b]"
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            console.log('Delete clicked')
                                        }
                                        className="cursor-pointer text-red-600 transition-colors dark:text-red-400 dark:hover:bg-[#3d4a6b] dark:focus:bg-[#3d4a6b] dark:focus:text-red-400"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                        <Link
<<<<<<< HEAD
                            href={
                                password
                                    ? `/flashcard/${deck.id}/player?password=${encodeURIComponent(password)}`
                                    : `/flashcard/${deck.id}/player`
                            }
=======
                            href={`/flashcard/${mockFlashCard.id}/memorize`}
>>>>>>> main
                            className="flex-1"
                        >
                            <Button
                                variant="outline"
                                className="border-lg h-auto w-full justify-start py-4 dark:border-gray-700 dark:bg-[#2e3856] dark:hover:bg-[#3d4a6b]"
                            >
                                <div className="flex items-center gap-3">
                                    <BookOpenCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <div className="text-left">
                                        <div className="text-lg font-semibold dark:text-white">
                                            Flashcards
                                        </div>
                                        <div className="text-base text-gray-500 dark:text-gray-400">
                                            Review terms and definitions
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        </Link>
                        <Link
                            href={
                                password
                                    ? `/flashcard/${deck.id}/learn?password=${encodeURIComponent(password)}`
                                    : `/flashcard/${deck.id}/learn`
                            }
                            className="flex-1"
                        >
                            <Button
                                variant="outline"
                                className="h-auto w-full justify-start py-4 dark:border-gray-700 dark:bg-[#2e3856] dark:hover:bg-[#3d4a6b]"
                            >
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    <div className="text-left">
                                        <div className="text-lg font-semibold dark:text-white">
                                            Learn
                                        </div>
                                        <div className="text-base text-gray-500 dark:text-gray-400">
                                            Study with adaptive learning
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        </Link>
                        <Link
                            href={
                                password
                                    ? `/flashcard/${deck.id}/test?password=${encodeURIComponent(password)}`
                                    : `/flashcard/${deck.id}/test`
                            }
                            className="flex-1"
                        >
                            <Button
                                variant="outline"
                                className="h-auto w-full justify-start py-4 dark:border-gray-700 dark:bg-[#2e3856] dark:hover:bg-[#3d4a6b]"
                            >
                                <div className="flex items-center gap-3">
                                    <ClipboardCheck className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                                    <div className="text-left">
                                        <div className="text-lg font-semibold dark:text-white">
                                            Test
                                        </div>
                                        <div className="text-base text-gray-500 dark:text-gray-400">
                                            Take a practice test
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        </Link>
                    </div>
                    <FlashcardPlayer cards={deckCards} />
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Terms in this set ({totalCards})
                    </h2>
                </div>

                <div className="space-y-3">
                    {deckCards.map((card, index) => (
                        <Card
                            key={card.id}
                            className="border border-gray-200 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-[#2e3856] dark:hover:shadow-xl dark:hover:shadow-black/20"
                        >
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="border-r border-gray-200 pr-8 dark:border-gray-700">
                                        <div className="mb-2 text-xs font-semibold text-gray-500 uppercase dark:text-gray-500">
                                            Term
                                        </div>
                                        <p className="text-base font-medium text-gray-900 dark:text-white">
                                            {card.front}
                                        </p>
                                    </div>
                                    <div className="pl-8">
                                        <div className="mb-2 text-xs font-semibold text-gray-500 uppercase dark:text-gray-500">
                                            Definition
                                        </div>
                                        <p className="text-base text-gray-700 dark:text-gray-300">
                                            {card.back}
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 text-sm font-semibold text-gray-400 dark:text-gray-600">
                                    {index + 1}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
