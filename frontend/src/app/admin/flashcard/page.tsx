'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DailyLearnersChart } from '@/components/daily-learners-chart';
import { TopDecksChart } from '@/components/top-decks-chart';
import { CardStatusChart } from '@/components/card-status-chart';

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
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Learners</CardTitle>
                        <CardDescription>
                            Number of learners per day over the last 30 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DailyLearnersChart />
                    </CardContent>
                </Card>

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
                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Most Learned Decks</CardTitle>
                        <CardDescription>
                            Decks with the highest number of learners
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TopDecksChart />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
