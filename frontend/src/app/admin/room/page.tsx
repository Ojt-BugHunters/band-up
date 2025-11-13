'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoomTrendsChart } from './room-trends-chart';
import { RoomTypesChart } from './room-types-chart';
import { TopRoomsLeaderboard } from './top-rooms-leaderboard';
import { BarChart3, Users, Lock, Unlock, TrendingUp, Zap } from 'lucide-react';
import { StatCard } from '@/components/admin-stats-card';

export default function RoomsAnalyticsPage() {
    return (
        <div className="m-4 mt-2 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Rooms Analytics Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                    Comprehensive insights and control for your Pomodoro rooms
                    platform
                </p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    {/* Main Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Rooms"
                            value="2,486"
                            change="14.2%"
                            icon={BarChart3}
                            isPositive
                        />
                        <StatCard
                            title="Public Rooms"
                            value="1,842"
                            change="73.9%"
                            icon={Unlock}
                            isPositive
                        />
                        <StatCard
                            title="Private Rooms"
                            value="644"
                            change="25.9%"
                            icon={Lock}
                            isPositive
                        />
                        <StatCard
                            title="Active Members"
                            value="4,352"
                            change="8.7%"
                            icon={Users}
                            isPositive
                        />
                    </div>

                    {/* Performance Overview and Fill Rate */}
                    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
                        {/* Room Performance Card */}
                        <Card className="md:col-span-2 lg:col-span-4 lg:row-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5" />
                                    Room Performance Overview
                                </CardTitle>
                                <CardDescription>
                                    Real-time room platform insights
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="text-muted-foreground text-sm font-medium">
                                            Current Activity
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    Rooms Active Now
                                                </span>
                                                <span className="text-xl font-bold">
                                                    642
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    Members In Session
                                                </span>
                                                <span className="text-xl font-bold">
                                                    3,127
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    Avg Members/Room
                                                </span>
                                                <span className="text-xl font-bold">
                                                    4.9
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
                                                    Peak Room Count
                                                </span>
                                                <span className="text-xl font-bold">
                                                    756
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    Avg Session Duration
                                                </span>
                                                <span className="text-xl font-bold">
                                                    23m
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    Room Growth Rate
                                                </span>
                                                <span className="text-xl font-bold">
                                                    +12% / week
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 border-t pt-4">
                                    <div className="text-muted-foreground text-sm font-medium">
                                        Room Status Distribution
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span>In Session</span>
                                                <span className="font-medium">
                                                    642 rooms (26%)
                                                </span>
                                            </div>
                                            <div className="bg-secondary h-2 rounded-full">
                                                <div
                                                    className="h-2 rounded-full bg-green-500"
                                                    style={{ width: '26%' }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span>Waiting</span>
                                                <span className="font-medium">
                                                    1,200 rooms (48%)
                                                </span>
                                            </div>
                                            <div className="bg-secondary h-2 rounded-full">
                                                <div
                                                    className="h-2 rounded-full bg-blue-500"
                                                    style={{ width: '48%' }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span>Closed</span>
                                                <span className="font-medium">
                                                    644 rooms (26%)
                                                </span>
                                            </div>
                                            <div className="bg-secondary h-2 rounded-full">
                                                <div
                                                    className="h-2 rounded-full bg-orange-500"
                                                    style={{ width: '26%' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Average Fill Rate Card */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <TrendingUp className="h-4 w-4" />
                                    Avg Fill Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground text-sm">
                                            Current Capacity
                                        </span>
                                        <span className="font-bold text-green-500">
                                            76.8%
                                        </span>
                                    </div>
                                    <div className="bg-secondary h-3 rounded-full">
                                        <div
                                            className="h-3 rounded-full bg-green-500"
                                            style={{ width: '76.8%' }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 border-t pt-4">
                                    <div className="text-muted-foreground text-xs font-medium">
                                        Fill Distribution
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs">
                                            {'<50%'}
                                        </span>
                                        <span className="text-xs font-medium">
                                            485
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs">50-75%</span>
                                        <span className="text-xs font-medium">
                                            726
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs">
                                            {'75-100%'}
                                        </span>
                                        <span className="text-xs font-medium">
                                            1,275
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Rooms Card - Mini Leaderboard */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <BarChart3 className="h-4 w-4" />
                                    Top Rooms
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white">
                                            1
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">
                                                Focus Hour
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                2.4k members
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-green-500">
                                        +18%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-xs font-bold text-white">
                                            2
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">
                                                Study Sprint
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                1.8k members
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-green-500">
                                        +12%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                                            3
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">
                                                Deep Work
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                1.2k members
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-green-500">
                                        +8%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                                            4
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">
                                                Code Marathon
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                956 members
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-red-500">
                                        -3%
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
                            <RoomTrendsChart />
                        </div>
                        <div className="lg:col-span-3">
                            <RoomTypesChart />
                        </div>
                    </div>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                    <TopRoomsLeaderboard />
                </TabsContent>
            </Tabs>
        </div>
    );
}
