'use client';

import { DailyLearnersChart } from '@/components/daily-learners-chart';
import { TopDecksChart } from '@/components/top-decks-chart';
import { CardStatusChart } from '@/components/card-status-chart';
import { FlashcardTable } from '@/components/flashcard-table';

export default function FlashcardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Flashcard Analytics
                </h1>
                <p className="text-muted-foreground mt-2">
                    Monitor learning trends and popular decks
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-1">
                <DailyLearnersChart />

                <CardStatusChart />

                <TopDecksChart />

                <FlashcardTable />
            </div>
        </div>
    );
}
