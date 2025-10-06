'use client';

import React from 'react';
import { mockDeckItems } from '../../../../../constants/sample-data';
import FlashcardPlayer from '@/components/flashcard-player';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { X, BookOpen, Brain, TestTubes, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function MemorizePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = React.use(params);

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <header className="bg-background border-b px-10 py-5 shadow-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="border-muted hover:bg-muted/30 flex items-center gap-2 rounded-xl px-4 py-2 text-base font-medium"
                                >
                                    <BookOpen className="text-primary h-5 w-5" />
                                    Flashcards
                                    <ChevronDown className="h-4 w-4 opacity-70" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="start"
                                className="w-48 rounded-xl shadow-md"
                            >
                                <DropdownMenuLabel className="text-muted-foreground">
                                    Study Modes
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="hover:bg-muted/40 focus:bg-muted/40 flex cursor-pointer items-center gap-2">
                                    <Link href="/">
                                        <Brain className="h-4 w-4 text-blue-500" />
                                        Learn
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-muted/40 focus:bg-muted/40 flex cursor-pointer items-center gap-2">
                                    <Link href="/">
                                        <TestTubes className="h-4 w-4 text-green-500" />
                                        Test
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2">
                        <h1 className="text-foreground text-lg font-semibold tracking-tight">
                            JPDI13 - Grammar Summary
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.history.back()}
                            className="h-10 w-10"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex flex-grow items-center justify-center px-6 py-10">
                <div className="w-full max-w-4xl">
                    <FlashcardPlayer cards={mockDeckItems} />
                </div>
            </main>
        </div>
    );
}
