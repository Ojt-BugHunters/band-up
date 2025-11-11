'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DailyLearnersChart } from './daily-learner-chart';
import { TopDecksChart } from './top-deck-chart';
import { CardStatusChart } from './card-status-chart';
import { FlashcardTable } from './flashcard-table';

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
                {/* Daily Learners Chart */}

                <DailyLearnersChart />

                {/* Card Status Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Card Status Distribution</CardTitle>
                        <CardDescription>
                            Breakdown of cards by mastery level
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CardStatusChart />
                    </CardContent>
                </Card>

                {/* Top Decks Chart */}

                <TopDecksChart />

                {/* Flashcard table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Flashcards</CardTitle>
                        <CardDescription>
                            Flashcards created by users
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FlashcardTable />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
