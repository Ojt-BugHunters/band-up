'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyLearnersChart } from './daily-learner-chart';
import { TopDecksChart } from './top-deck-chart';
import { FlashcardTable } from './flashcard-table';
import { CompletionRateChart } from './completion-rate-chart';
import { EngagementMetricsChart } from './engagement-metric-chart';
import { StudyTimeChart } from './study-time-chart';
import {
    Brain,
    Users,
    CreditCard,
    Target,
    Clock,
    Zap,
    Award,
    UserPlus,
    Layers,
} from 'lucide-react';
import { StatCard } from '@/components/admin-stats-card';

export default function FlashcardPage() {
    return (
        <div className="m-4 mt-2 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Flashcard Analytics Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                    Comprehensive insights and control for your learning
                    platform
                </p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Overview - Stats - Need connect API here */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Learners"
                            value="12,456"
                            change="12.5%"
                            icon={Users}
                            isPositive
                        />
                        <StatCard
                            title="Total Cards"
                            value="12,456"
                            change="8.2%"
                            icon={CreditCard}
                            isPositive
                        />
                        <StatCard
                            title="Active Decks"
                            value="248"
                            change="5.7%"
                            icon={Brain}
                            isPositive
                        />
                        <StatCard
                            title="Completion Rate"
                            value="68.4%"
                            change="3.1%"
                            icon={Target}
                            isPositive
                        />{' '}
                    </div>

                    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
                        {/* Overview - Performance - Need to connect API here */}
                        <Card className="md:col-span-2 lg:col-span-4 lg:row-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5" />
                                    Performance Overview
                                </CardTitle>
                                <CardDescription>
                                    Real-time platform insights
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="text-muted-foreground text-sm font-medium">
                                            Today Activity
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    Active Now
                                                </span>
                                                <span className="text-xl font-bold">
                                                    1,234
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    Cards Reviewed
                                                </span>
                                                <span className="text-xl font-bold">
                                                    8,432
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    Card Created
                                                </span>
                                                <span className="text-xl font-bold">
                                                    3,456
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="text-muted-foreground text-sm font-medium">
                                            Weekly Trends
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    Median Session Time
                                                </span>
                                                <span className="text-xl font-bold">
                                                    24m
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    Total Study Time
                                                </span>
                                                <span className="text-xl font-bold">
                                                    1,840h
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    Learning Velocity
                                                </span>
                                                <span className="text-xl font-bold">
                                                    100 cards / week
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 border-t pt-4">
                                    <div className="text-muted-foreground text-sm font-medium">
                                        Mastery Progress
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span>Easy</span>
                                                <span className="font-medium">
                                                    245 cards (37%)
                                                </span>
                                            </div>
                                            <div className="bg-secondary h-2 rounded-full">
                                                <div
                                                    className="h-2 rounded-full bg-green-500"
                                                    style={{ width: '37%' }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span>Medium</span>
                                                <span className="font-medium">
                                                    198 cards (30%)
                                                </span>
                                            </div>
                                            <div className="bg-secondary h-2 rounded-full">
                                                <div
                                                    className="h-2 rounded-full bg-blue-500"
                                                    style={{ width: '30%' }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span>Hard</span>
                                                <span className="font-medium">
                                                    219 cards (33%)
                                                </span>
                                            </div>
                                            <div className="bg-secondary h-2 rounded-full">
                                                <div
                                                    className="h-2 rounded-full bg-orange-500"
                                                    style={{ width: '33%' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Connect API here */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Clock className="h-4 w-4" />
                                    Peak Hours
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">
                                        Morning (6-12)
                                    </span>
                                    <span className="font-bold">2,340</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">
                                        Afternoon (12-18)
                                    </span>
                                    <span className="font-bold text-green-500">
                                        4,560
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">
                                        Evening (18-24)
                                    </span>
                                    <span className="font-bold">3,120</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">
                                        Night (0-6)
                                    </span>
                                    <span className="font-bold">890</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Award className="h-4 w-4" />
                                    Top Performers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white">
                                            1
                                        </div>
                                        <span className="text-sm">
                                            Sarah Chen
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        98.5%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-xs font-bold text-white">
                                            2
                                        </div>
                                        <span className="text-sm">
                                            Mike Johnson
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        97.2%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                                            3
                                        </div>
                                        <span className="text-sm">
                                            Emma Davis
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        96.8%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                                            4
                                        </div>
                                        <span className="text-sm">
                                            Alex Wilson
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">
                                        95.9%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <div className="lg:col-span-4">
                            <CompletionRateChart />
                        </div>
                        <div className="lg:col-span-3">
                            <StudyTimeChart />
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <EngagementMetricsChart />
                        <Card>
                            <CardHeader>
                                <CardTitle>Retention Rate</CardTitle>
                                <CardDescription>
                                    7-day, 30-day, and 90-day retention
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* TODO: Fill the retention data here */}
                                <div className="space-y-4">
                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                7-Day Retention
                                            </span>
                                            <span className="font-medium">
                                                82%
                                            </span>
                                        </div>
                                        <div className="bg-secondary h-2 rounded-full">
                                            <div
                                                className="bg-primary h-2 rounded-full"
                                                style={{ width: '82%' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                30-Day Retention
                                            </span>
                                            <span className="font-medium">
                                                64%
                                            </span>
                                        </div>
                                        <div className="bg-secondary h-2 rounded-full">
                                            <div
                                                className="bg-chart-2 h-2 rounded-full"
                                                style={{ width: '64%' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                90-Day Retention
                                            </span>
                                            <span className="font-medium">
                                                48%
                                            </span>
                                        </div>
                                        <div className="bg-secondary h-2 rounded-full">
                                            <div
                                                className="bg-chart-3 h-2 rounded-full"
                                                style={{ width: '48%' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <TopDecksChart />
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-6">
                    {/* TODO: Connect API Deck - User metric here */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="Active Learners (30d)"
                            value="8,452"
                            change="12.3%"
                            icon={Users}
                            isPositive
                        />
                        <StatCard
                            title="New Learners"
                            value="2,317"
                            change="18.6%"
                            icon={UserPlus}
                            isPositive
                        />
                        <StatCard
                            title="Avg. Deck Engagement"
                            value="2.1 decks/user"
                            change="7.4%"
                            icon={Layers}
                            isPositive
                        />{' '}
                    </div>

                    <DailyLearnersChart />
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Flashcards</CardTitle>
                            <CardDescription>
                                All flashcards created by users
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FlashcardTable />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
