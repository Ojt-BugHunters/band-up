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
import { CardStatusChart } from '@/components/card-status-chart';
import { FlashcardTable } from '@/components/flashcard-table';
import { CompletionRateChart } from './completion-rate-chart';
import { EngagementMetricsChart } from './engagement-metric-chart';
import { StudyTimeChart } from './study-time-chart';
import {
    Brain,
    TrendingUp,
    Users,
    CreditCard,
    Target,
    Clock,
    Zap,
    Award,
} from 'lucide-react';

export default function FlashcardPage() {
    return (
        <div className="space-y-6">
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

                {/* Overview Tab - Professional Bento Grid without duplicates */}
                <TabsContent value="overview" className="space-y-4">
                    {/* Top Row - Key Metrics Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Learners
                                </CardTitle>
                                <Users className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12,456</div>
                                <p className="text-muted-foreground text-xs">
                                    <span className="text-green-500">
                                        +12.5%
                                    </span>{' '}
                                    from last month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Cards
                                </CardTitle>
                                <CreditCard className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12,456</div>
                                <p className="text-muted-foreground text-xs">
                                    <span className="text-green-500">
                                        +8.2%
                                    </span>{' '}
                                    from last month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Decks
                                </CardTitle>
                                <Brain className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">248</div>
                                <p className="text-muted-foreground text-xs">
                                    <span className="text-green-500">
                                        +5.7%
                                    </span>{' '}
                                    from last month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Completion Rate
                                </CardTitle>
                                <Target className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">68.4%</div>
                                <p className="text-muted-foreground text-xs">
                                    <span className="text-green-500">
                                        +3.1%
                                    </span>{' '}
                                    from last month
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bento Grid - Asymmetric Layout */}
                    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
                        {/* Large Featured Card - Performance Summary */}
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
                                                    Study Sessions
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
                                                    Avg. Session Time
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
                                                    Accuracy Rate
                                                </span>
                                                <span className="text-xl font-bold">
                                                    76%
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
                                                <span>Mastered</span>
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
                                                <span>Learning</span>
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
                                                <span>Review</span>
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

                        {/* Side Cards - Stacked */}
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

                        {/* Medium Width Cards */}
                        <Card className="md:col-span-2 lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Milestones</CardTitle>
                                <CardDescription>
                                    Latest achievements across the platform
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3 border-b pb-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                                        <Award className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">
                                            1,000 Cards Mastered
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            Sarah Chen reached this milestone
                                        </div>
                                    </div>
                                    <div className="text-muted-foreground text-xs">
                                        2m ago
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 border-b pb-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                                        <Zap className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">
                                            30-Day Streak
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            Mike Johnson maintained consistency
                                        </div>
                                    </div>
                                    <div className="text-muted-foreground text-xs">
                                        15m ago
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
                                        <Brain className="h-4 w-4 text-purple-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">
                                            New Deck Published
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            Advanced JavaScript created by Emma
                                            Davis
                                        </div>
                                    </div>
                                    <div className="text-muted-foreground text-xs">
                                        1h ago
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2 lg:col-span-3">
                            <CardHeader>
                                <CardTitle>System Health</CardTitle>
                                <CardDescription>
                                    Platform performance metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            API Response Time
                                        </span>
                                        <span className="font-medium text-green-500">
                                            Excellent (45ms)
                                        </span>
                                    </div>
                                    <div className="bg-secondary h-2 rounded-full">
                                        <div
                                            className="h-2 rounded-full bg-green-500"
                                            style={{ width: '92%' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Server Load
                                        </span>
                                        <span className="font-medium text-blue-500">
                                            Normal (34%)
                                        </span>
                                    </div>
                                    <div className="bg-secondary h-2 rounded-full">
                                        <div
                                            className="h-2 rounded-full bg-blue-500"
                                            style={{ width: '34%' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Database Performance
                                        </span>
                                        <span className="font-medium text-green-500">
                                            Optimal (98%)
                                        </span>
                                    </div>
                                    <div className="bg-secondary h-2 rounded-full">
                                        <div
                                            className="h-2 rounded-full bg-green-500"
                                            style={{ width: '98%' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Error Rate
                                        </span>
                                        <span className="font-medium text-green-500">
                                            Low (0.02%)
                                        </span>
                                    </div>
                                    <div className="bg-secondary h-2 rounded-full">
                                        <div
                                            className="h-2 rounded-full bg-green-500"
                                            style={{ width: '2%' }}
                                        />
                                    </div>
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
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>New Users</CardTitle>
                                <CardDescription>This month</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">2,847</div>
                                <div className="mt-2 flex items-center text-sm">
                                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                                    <span className="text-green-500">
                                        +18.2%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Active Users</CardTitle>
                                <CardDescription>Last 30 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">8,234</div>
                                <div className="mt-2 flex items-center text-sm">
                                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                                    <span className="text-green-500">
                                        +12.4%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Avg. Session Time</CardTitle>
                                <CardDescription>Per user</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">28m</div>
                                <div className="mt-2 flex items-center text-sm">
                                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                                    <span className="text-green-500">
                                        +5.7%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <DailyLearnersChart />
                    <EngagementMetricsChart />
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Card Status Distribution</CardTitle>
                                <CardDescription>
                                    Current status breakdown
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CardStatusChart />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Content Overview</CardTitle>
                                <CardDescription>
                                    Deck and card statistics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <span className="text-sm font-medium">
                                        Total Decks
                                    </span>
                                    <span className="text-2xl font-bold">
                                        248
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-3">
                                    <span className="text-sm font-medium">
                                        Total Cards
                                    </span>
                                    <span className="text-2xl font-bold">
                                        12,456
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-3">
                                    <span className="text-sm font-medium">
                                        Avg. Cards per Deck
                                    </span>
                                    <span className="text-2xl font-bold">
                                        50
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                        Decks Created Today
                                    </span>
                                    <span className="text-2xl font-bold">
                                        12
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <TopDecksChart />

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
