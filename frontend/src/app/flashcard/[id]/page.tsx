'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import {
    mockFlashcards,
    flashcardItemsForSet1,
} from '../../../../constants/sample-data';
import FlashcardPlayer from '@/components/flashcard-player';
import {
    Hero,
    HeroDescription,
    HeroKeyword,
    HeroSummary,
    HeroTitle,
} from '@/components/hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { BookOpenCheck, ClipboardCheck, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function FlashcardDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // unwrap params Promise
    const { id } = React.use(params);

    const flashcard = mockFlashcards.find((card) => card.id === id);
    if (!flashcard) return notFound();

    const createdAt = flashcard.created_at
        ? new Date(flashcard.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : 'Unknown date';

    const itemsByDeck: Record<string, typeof flashcardItemsForSet1> = {
        '1': flashcardItemsForSet1,
    };
    const items = itemsByDeck[flashcard.id] ?? [];

    return (
        <div className="flex-1 space-y-6 p-6">
            <Hero>
                <HeroSummary color="green">
                    <BookOpenCheck className="mr-2 h-4 w-4" />
                    Flashcard Detail
                </HeroSummary>
                <HeroTitle>
                    {flashcard.title}
                    <HeroKeyword color="blue">Deck</HeroKeyword>
                </HeroTitle>
                <HeroDescription>
                    Created by <strong>{flashcard.author_name}</strong> —{' '}
                    {createdAt} —{' '}
                    <Badge
                        variant="secondary"
                        className={
                            flashcard.is_public
                                ? 'bg-green-100 text-green-600'
                                : 'bg-rose-100 text-rose-600'
                        }
                    >
                        {flashcard.is_public ? 'Public' : 'Private'}
                    </Badge>
                </HeroDescription>
            </Hero>

            <div className="mx-auto max-w-7xl space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Link href={`/flashcard/${flashcard.id}/player`}>
                        <Card className="cursor-pointer transition hover:shadow-lg">
                            <CardHeader className="flex items-center space-x-2">
                                <BookOpenCheck className="h-6 w-6 text-blue-500" />
                                <CardTitle>Thẻ ghi nhớ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Xem toàn bộ thẻ ghi nhớ trong bộ này.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={`/flashcard/${flashcard.id}/learn`}>
                        <Card className="cursor-pointer transition hover:shadow-lg">
                            <CardHeader className="flex items-center space-x-2">
                                <GraduationCap className="h-6 w-6 text-green-500" />
                                <CardTitle>Học</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Học từng thẻ với chế độ ôn tập chủ động.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={`/flashcard/${flashcard.id}/test`}>
                        <Card className="cursor-pointer transition hover:shadow-lg">
                            <CardHeader className="flex items-center space-x-2">
                                <ClipboardCheck className="h-6 w-6 text-rose-500" />
                                <CardTitle>Kiểm tra</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Làm bài kiểm tra để đánh giá kiến thức.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
                {/* FlashcardPlayer */}
                <FlashcardPlayer cards={items} />

                {/* Bảng danh sách flashcard */}
                <Table>
                    <TableCaption>
                        Danh sách tất cả flashcard trong bộ này
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px] font-extrabold">
                                #
                            </TableHead>
                            <TableHead>Vocabularies</TableHead>
                            <TableHead>Definitions</TableHead>
                            <TableHead>Examples</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">
                                    {index + 1}
                                </TableCell>
                                <TableCell>{item.front}</TableCell>
                                <TableCell>{item.back}</TableCell>
                                <TableCell>{item.example}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
