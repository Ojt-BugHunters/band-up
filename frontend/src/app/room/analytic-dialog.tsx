import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
    Atom,
    BarChart3,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Flame,
    ListTodo,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';
import { mockAnalyticsData, mockStats } from '../../../constants/sample-data';

interface AnalyticComponentProps {
    analyticsDate: Date;
    showAnalytics: boolean;
    setShowAnalytics: (show: boolean) => void;
    analyticsPeriod: 'today' | 'week' | 'month';
    setAnalyticsPeriod: (period: 'today' | 'week' | 'month') => void;
    navigateAnalyticsDate: (direction: 'prev' | 'next') => void;
    formatAnalyticsDate: (date: Date) => string;
}

export function AnalyticComponent({
    analyticsDate,
    showAnalytics,
    setShowAnalytics,
    analyticsPeriod,
    setAnalyticsPeriod,
    navigateAnalyticsDate,
    formatAnalyticsDate,
}: AnalyticComponentProps) {
    return (
        <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
            <DialogContent className="border-zinc-700/50 bg-zinc-900/95 p-0 text-white shadow-2xl shadow-black/40 backdrop-blur-xl sm:max-w-4xl [&>button]:hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex max-h-[85vh] flex-col"
                >
                    <div className="flex-shrink-0 border-b border-zinc-700/50 bg-zinc-900/50 p-6 backdrop-blur-md">
                        <h2 className="mb-6 text-2xl font-bold">
                            Activities summary
                        </h2>

                        <Tabs defaultValue="analytics" className="w-full">
                            <TabsList className="mb-6 grid w-full grid-cols-2 border border-zinc-700/30 bg-zinc-800/50">
                                <TabsTrigger
                                    value="analytics"
                                    className="font-semibold data-[state=active]:bg-zinc-700/80 data-[state=active]:text-white"
                                >
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Analytics
                                </TabsTrigger>
                                <TabsTrigger
                                    value="sessions"
                                    className="font-semibold data-[state=active]:bg-zinc-700/80 data-[state=active]:text-white"
                                >
                                    <ListTodo className="mr-2 h-4 w-4" />
                                    Review Sessions
                                </TabsTrigger>
                            </TabsList>

                            <div className="relative">
                                <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-6 bg-gradient-to-b from-zinc-900/95 to-transparent" />

                                <div
                                    className="max-h-[calc(85vh-120px)] overflow-y-auto scroll-smooth px-1"
                                    style={{
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: '#52525b #181818',
                                    }}
                                >
                                    <TabsContent
                                        value="analytics"
                                        className="space-y-6 pb-4"
                                    >
                                        <div className="flex items-center justify-center gap-4">
                                            <button
                                                onClick={() =>
                                                    setAnalyticsPeriod('today')
                                                }
                                                className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                                    analyticsPeriod === 'today'
                                                        ? 'scale-105 bg-white text-black shadow-xl shadow-white/20'
                                                        : 'border border-zinc-700/50 bg-zinc-800/80 text-white/80 shadow-lg shadow-black/20 hover:scale-105 hover:bg-zinc-700/80 hover:text-white'
                                                }`}
                                            >
                                                Today
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setAnalyticsPeriod('week')
                                                }
                                                className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                                    analyticsPeriod === 'week'
                                                        ? 'scale-105 bg-white text-black shadow-xl shadow-white/20'
                                                        : 'border border-zinc-700/50 bg-zinc-800/80 text-white/80 shadow-lg shadow-black/20 hover:scale-105 hover:bg-zinc-700/80 hover:text-white'
                                                }`}
                                            >
                                                This week
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setAnalyticsPeriod('month')
                                                }
                                                className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                                    analyticsPeriod === 'month'
                                                        ? 'scale-105 bg-white text-black shadow-xl shadow-white/20'
                                                        : 'border border-zinc-700/50 bg-zinc-800/80 text-white/80 shadow-lg shadow-black/20 hover:scale-105 hover:bg-zinc-700/80 hover:text-white'
                                                }`}
                                            >
                                                This month
                                            </button>
                                        </div>

                                        <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-6 shadow-xl shadow-black/20 backdrop-blur-md">
                                            <div className="mb-6 flex items-center justify-between">
                                                <button
                                                    onClick={() =>
                                                        navigateAnalyticsDate(
                                                            'prev',
                                                        )
                                                    }
                                                    className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-2.5 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-110 hover:bg-zinc-700/80"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </button>
                                                <div className="text-center">
                                                    <span className="text-base font-bold">
                                                        {formatAnalyticsDate(
                                                            analyticsDate,
                                                        )}
                                                    </span>
                                                    <div className="mt-1">
                                                        <span className="text-sm text-white/60">
                                                            Total Time:{' '}
                                                        </span>
                                                        <span className="text-sm font-bold">
                                                            0h 0m
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        navigateAnalyticsDate(
                                                            'next',
                                                        )
                                                    }
                                                    className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-2.5 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-110 hover:bg-zinc-700/80"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>

                                            <div className="relative h-[420px] overflow-hidden">
                                                <ChartContainer
                                                    config={{
                                                        minutes: {
                                                            label: 'Minutes',
                                                            color: 'hsl(var(--chart-1))',
                                                        },
                                                    }}
                                                >
                                                    <ResponsiveContainer
                                                        width="100%"
                                                        height="100%"
                                                    >
                                                        <AreaChart
                                                            data={
                                                                mockAnalyticsData
                                                            }
                                                        >
                                                            <defs>
                                                                <linearGradient
                                                                    id="colorMinutes"
                                                                    x1="0"
                                                                    y1="0"
                                                                    x2="0"
                                                                    y2="1"
                                                                >
                                                                    <stop
                                                                        offset="5%"
                                                                        stopColor="#3b82f6"
                                                                        stopOpacity={
                                                                            0.3
                                                                        }
                                                                    />
                                                                    <stop
                                                                        offset="95%"
                                                                        stopColor="#3b82f6"
                                                                        stopOpacity={
                                                                            0
                                                                        }
                                                                    />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid
                                                                strokeDasharray="3 3"
                                                                stroke="#52525b"
                                                                opacity={0.3}
                                                            />
                                                            <XAxis
                                                                dataKey="time"
                                                                stroke="#a1a1aa"
                                                                fontSize={12}
                                                            />
                                                            <YAxis
                                                                stroke="#a1a1aa"
                                                                fontSize={12}
                                                            />
                                                            <ChartTooltip
                                                                content={
                                                                    <ChartTooltipContent />
                                                                }
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="minutes"
                                                                stroke="#3b82f6"
                                                                strokeWidth={2}
                                                                fillOpacity={1}
                                                                fill="url(#colorMinutes)"
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </ChartContainer>
                                            </div>
                                        </div>

                                        <div className="mt-8 grid grid-cols-3 gap-4">
                                            <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-6 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-800/80">
                                                <div className="mb-3 flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-600/50 bg-zinc-700/80">
                                                        <BarChart3 className="h-5 w-5 text-white" />
                                                    </div>
                                                    <span className="text-sm font-medium text-white/70">
                                                        Total Sessions
                                                    </span>
                                                </div>
                                                <p className="text-4xl font-bold">
                                                    {mockStats.totalSessions}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-6 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-800/80">
                                                <div className="mb-3 flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-600/50 bg-zinc-700/80">
                                                        <Clock className="h-5 w-5 text-white" />
                                                    </div>
                                                    <span className="text-sm font-medium text-white/70">
                                                        Focused Time
                                                    </span>
                                                </div>
                                                <p className="text-4xl font-bold">
                                                    {mockStats.focusedTime}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-6 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-800/80">
                                                <div className="mb-3 flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-600/50 bg-zinc-700/80">
                                                        <Flame className="h-5 w-5 text-white" />
                                                    </div>
                                                    <span className="text-sm font-medium text-white/70">
                                                        Best Sessions
                                                    </span>
                                                </div>
                                                <p className="text-4xl font-bold">
                                                    {mockStats.bestSessions}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-6 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-800/80">
                                                <div className="mb-3 flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-600/50 bg-zinc-700/80">
                                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                                    </div>
                                                    <span className="text-sm font-medium text-white/70">
                                                        Tasks completed
                                                    </span>
                                                </div>
                                                <p className="text-4xl font-bold">
                                                    {mockStats.tasksCompleted}
                                                </p>
                                            </div>

                                            <div className="col-span-2 rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-6 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-800/80">
                                                <div className="mb-3 flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-600/50 bg-zinc-700/80">
                                                        <Atom className="h-5 w-5 text-white" />
                                                    </div>
                                                    <span className="text-sm font-medium text-white/70">
                                                        Focus Score
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-4xl font-bold">
                                                        {mockStats.focusScore}
                                                    </p>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map(
                                                            (star) => (
                                                                <div
                                                                    key={star}
                                                                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/30"
                                                                >
                                                                    <div className="h-3 w-3 rounded-full bg-white/20" />
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent
                                        value="sessions"
                                        className="space-y-4 pb-4"
                                    >
                                        <div className="space-y-3">
                                            <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-5 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-zinc-800/80">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div>
                                                        <h3 className="mb-1 text-lg font-bold text-white">
                                                            Morning Study
                                                            Session
                                                        </h3>
                                                        <p className="text-sm text-white/60">
                                                            Today, 9:00 AM -
                                                            10:25 AM
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-green-500/30 bg-green-500/20 px-3 py-1">
                                                        <span className="text-sm font-semibold text-green-400">
                                                            Completed
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-white/70" />
                                                        <span className="text-white/80">
                                                            1h 25m
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-white/70" />
                                                        <span className="text-white/80">
                                                            3 tasks completed
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Flame className="h-4 w-4 text-white/70" />
                                                        <span className="text-white/80">
                                                            4 Pomodoros
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-5 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-zinc-800/80">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div>
                                                        <h3 className="mb-1 text-lg font-bold text-white">
                                                            Afternoon Focus
                                                        </h3>
                                                        <p className="text-sm text-white/60">
                                                            Yesterday, 2:00 PM -
                                                            3:50 PM
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-green-500/30 bg-green-500/20 px-3 py-1">
                                                        <span className="text-sm font-semibold text-green-400">
                                                            Completed
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-white/70" />
                                                        <span className="text-white/80">
                                                            1h 50m
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-white/70" />
                                                        <span className="text-white/80">
                                                            5 tasks completed
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Flame className="h-4 w-4 text-white/70" />
                                                        <span className="text-white/80">
                                                            4 Pomodoros
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-5 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-zinc-800/80">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div>
                                                        <h3 className="mb-1 text-lg font-bold text-white">
                                                            Evening Review
                                                        </h3>
                                                        <p className="text-sm text-white/60">
                                                            Yesterday, 7:30 PM -
                                                            8:15 PM
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-green-500/30 bg-green-500/20 px-3 py-1">
                                                        <span className="text-sm font-semibold text-green-400">
                                                            Completed
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-white/70" />
                                                        <span className="text-white/80">
                                                            45m
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-white/70" />
                                                        <span className="text-white/80">
                                                            2 tasks completed
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Flame className="h-4 w-4 text-white/70" />
                                                        <span className="text-white/80">
                                                            2 Pomodoros
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/60 p-5 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-zinc-800/80">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div>
                                                        <h3 className="mb-1 text-lg font-bold text-white">
                                                            Quick Study Break
                                                        </h3>
                                                        <p className="text-sm text-white/60">
                                                            2 days ago, 11:00 AM
                                                            - 11:30 AM
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/20 px-3 py-1">
                                                        <span className="text-sm font-semibold text-yellow-400">
                                                            Partial
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-white/70" />
                                                        <span className="text-white/80">
                                                            30m
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-white/70" />
                                                        <span className="text-white/80">
                                                            1 task completed
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Flame className="h-4 w-4 text-white/70" />
                                                        <span className="text-white/80">
                                                            1 Pomodoro
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>

                                <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-6 bg-gradient-to-t from-zinc-900/95 to-transparent" />
                            </div>
                        </Tabs>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
