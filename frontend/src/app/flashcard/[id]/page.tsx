'use client';
import React from 'react';
import {
    mockFlashCard,
    mockDeckItems,
} from '../../../../constants/sample-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    BookOpenCheck,
    GraduationCap,
    ClipboardCheck,
    Settings,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import FlashcardPlayer from '@/components/flashcard-player';
import { AccountPicture } from '@/components/ui/account-picture';

export default function FlashcardDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = React.use(params);

    const totalCards = mockDeckItems.length;

    return (
        <div className="mt-20 min-h-screen bg-gray-50 dark:bg-[#0a092d]">
            <div className="bg-white dark:bg-[#0a092d]">
                <div className="mx-auto max-w-7xl px-6 py-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
                                {mockFlashCard.title}
                            </h1>
                            <div className="mb-4 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8">
                                        <AccountPicture
                                            name={mockFlashCard.author_name}
                                        />
                                    </div>
                                    <span className="font-medium dark:text-gray-300">
                                        {mockFlashCard.author_name}
                                    </span>
                                </div>
                                <span>•</span>
                                <span>
                                    {new Date(
                                        mockFlashCard.created_at,
                                    ).toLocaleDateString()}
                                </span>
                                <span>•</span>
                                <Badge
                                    variant="secondary"
                                    className={
                                        mockFlashCard.is_public
                                            ? 'border-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'border-0 bg-gray-200 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300'
                                    }
                                >
                                    {mockFlashCard.is_public
                                        ? 'Public'
                                        : 'Private'}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="dark:border-gray-700 dark:bg-[#2e3856] dark:text-white dark:hover:bg-[#3d4a6b]"
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                        <Link
                            href={`/flashcard/${mockFlashCard.id}/player`}
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
                            href={`/flashcard/${mockFlashCard.id}/learn`}
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
                            href={`/flashcard/${mockFlashCard.id}/test`}
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
                    <FlashcardPlayer cards={mockDeckItems} />
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Terms in this set ({totalCards})
                    </h2>
                </div>

                <div className="space-y-3">
                    {mockDeckItems.map((card, index) => (
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
