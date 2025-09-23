'use client';

import type { Flashcard } from '@/lib/api/dto/flashcards';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Globe, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FlashcardCard({ card }: { card: Flashcard }) {
    const createdAt = card.created_at ? new Date(card.created_at) : null;
    const createdLabel =
        createdAt && !Number.isNaN(createdAt.getTime())
            ? createdAt.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
              })
            : 'Unknown date';

    const isPublic = card.is_public;

    return (
        <Link href={`/flashcard/${card.id}`} passHref>
            <Card
                className={cn(
                    'h-full transform cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl',
                    isPublic
                        ? 'border border-green-200 bg-gradient-to-br from-green-50 via-white to-green-100'
                        : 'border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-rose-100',
                )}
            >
                <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            {createdLabel}
                        </span>
                        <div className="flex items-center gap-1">
                            {isPublic ? (
                                <Globe className="h-4 w-4 text-green-600" />
                            ) : (
                                <Lock className="h-4 w-4 text-rose-600" />
                            )}
                            {!isPublic && (
                                <Badge
                                    variant="secondary"
                                    className="bg-rose-100 text-xs text-rose-700"
                                >
                                    Private
                                </Badge>
                            )}
                        </div>
                    </div>
                    <CardTitle className="text-base leading-snug font-semibold">
                        {card.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                        {card.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="flex items-center gap-1 text-sm font-medium text-slate-700">
                        👤 {card.author_name}
                    </p>
                    <p className="text-sm text-slate-600">
                        {card.number_learner} learners
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
