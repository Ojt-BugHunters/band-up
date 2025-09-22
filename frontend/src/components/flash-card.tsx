'use client';

import type { Flashcard } from '@/lib/api/dto/flashcards';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getFlashcardStyle } from '@/lib/flashcard-style';
import { cn } from '@/lib/utils';

type FlashcardCardProps = {
    card: Flashcard;
};

export default function FlashcardCard({ card }: FlashcardCardProps) {
    const createdAt = card.created_at ? new Date(card.created_at) : null;
    const createdLabel = createdAt && !Number.isNaN(createdAt.getTime())
        ? createdAt.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : 'Unknown date';

    const styles = getFlashcardStyle(card.skill);

    return (
        <Card
            className={cn(
                'h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
                styles.border,
                styles.background,
            )}
        >
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                    <Badge className={cn('uppercase', styles.badge)}>
                        {card.skill}
                    </Badge>
                    <span className="text-xs text-slate-400">{createdLabel}</span>
                </div>
                <CardTitle className="text-base font-semibold leading-snug">
                    {card.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm">
                    {card.definition}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <p
                        className={cn(
                            'text-xs font-medium uppercase tracking-wide',
                            styles.label,
                        )}
                    >
                        Term
                    </p>
                    <p className={cn('text-sm font-semibold', styles.term)}>
                        {card.term}
                    </p>
                </div>
                <div>
                    <p
                        className={cn(
                            'text-xs font-medium uppercase tracking-wide',
                            styles.label,
                        )}
                    >
                        Definition
                    </p>
                    <p className="text-sm text-slate-600 line-clamp-3">
                        {card.definition}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
