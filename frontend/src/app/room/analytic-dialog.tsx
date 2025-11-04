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
            <DialogContent className="border-none bg-transparent p-0 text-white shadow-none sm:max-w-4xl [&>button]:hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex max-h-[90vh] flex-col"
                >
                    {/* Liquid-glass header card */}
                    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0f]/70 shadow-[0_30px_80px_rgba(0,0,0,.6)] ring-1 ring-white/10 backdrop-blur-2xl">
                        {/* glow + sheen */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -inset-16 -z-10 opacity-40 blur-3xl"
                            style={{
                                background:
                                    'radial-gradient(1200px 600px at 20% 10%, rgba(255,255,255,.08), transparent 60%), radial-gradient(800px 500px at 80% 0%, rgba(255,255,255,.05), transparent 60%)',
                            }}
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-40"
                            style={{
                                background:
                                    'linear-gradient(to bottom right, rgba(255,255,255,.18), rgba(255,255,255,.04) 30%, rgba(255,255,255,0) 60%)',
                                maskImage:
                                    'radial-gradient(120% 120% at 0% 0%, black 40%, transparent 60%)',
                            }}
                        />

                        <div className="border-white/10/50 flex-shrink-0 border-b p-6">
                            <h2 className="mb-6 text-2xl font-bold">
                                Activities summary
                            </h2>

                            <Tabs defaultValue="analytics" className="w-full">
                                <TabsList className="mb-6 grid w-full grid-cols-2 rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm">
                                    <TabsTrigger
                                        value="analytics"
                                        className="font-semibold text-white/80 transition-colors hover:text-white data-[state=active]:bg-white/25 data-[state=active]:text-white"
                                    >
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Analytics
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="sessions"
                                        className="font-semibold text-white/80 transition-colors hover:text-white data-[state=active]:bg-white/25 data-[state=active]:text-white"
                                    >
                                        <ListTodo className="mr-2 h-4 w-4" />
                                        Review Sessions
                                    </TabsTrigger>
                                </TabsList>

                                <div className="relative">
                                    <div
                                        className="max-h-[calc(85vh-140px)] overflow-y-auto scroll-smooth px-1"
                                        style={{
                                            scrollbarWidth: 'thin',
                                            scrollbarColor: '#6b7280 #0b0b0f',
                                        }}
                                    >
                                        <TabsContent
                                            value="analytics"
                                            className="space-y-6 pb-4"
                                        >
                                            <div className="flex items-center justify-center gap-4">
                                                {(
                                                    [
                                                        'today',
                                                        'week',
                                                        'month',
                                                    ] as const
                                                ).map((p) => (
                                                    <button
                                                        key={p}
                                                        onClick={() =>
                                                            setAnalyticsPeriod(
                                                                p,
                                                            )
                                                        }
                                                        className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                                            analyticsPeriod ===
                                                            p
                                                                ? 'scale-105 bg-white text-black shadow-xl shadow-white/20'
                                                                : 'border border-white/15 bg-white/10 text-white/80 shadow-[0_8px_25px_rgba(0,0,0,0.4)] hover:scale-105 hover:bg-white/15 hover:text-white'
                                                        }`}
                                                    >
                                                        {p === 'today'
                                                            ? 'Today'
                                                            : p === 'week'
                                                              ? 'This week'
                                                              : 'This month'}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="mb-8 rounded-2xl border border-white/12 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,.5)] backdrop-blur-2xl">
                                                <div className="mb-6 flex items-center justify-between">
                                                    <button
                                                        onClick={() =>
                                                            navigateAnalyticsDate(
                                                                'prev',
                                                            )
                                                        }
                                                        className="rounded-xl border border-white/15 bg-white/10 p-2.5 shadow-[0_8px_25px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all hover:scale-110 hover:bg-white/15"
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
                                                            <span className="text-sm text-white/70">
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
                                                        className="rounded-xl border border-white/15 bg-white/10 p-2.5 shadow-[0_8px_25px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all hover:scale-110 hover:bg-white/15"
                                                    >
                                                        <ChevronRight className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                <div className="relative min-h-[480px] overflow-visible">
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
                                                                margin={{
                                                                    top: 10,
                                                                    right: 10,
                                                                    left: 0,
                                                                    bottom: 0,
                                                                }}
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
                                                                    stroke="#a1a1aa"
                                                                    opacity={
                                                                        0.15
                                                                    }
                                                                />
                                                                <XAxis
                                                                    dataKey="time"
                                                                    stroke="#d4d4d8"
                                                                    fontSize={
                                                                        12
                                                                    }
                                                                />
                                                                <YAxis
                                                                    stroke="#d4d4d8"
                                                                    fontSize={
                                                                        12
                                                                    }
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
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    fillOpacity={
                                                                        1
                                                                    }
                                                                    fill="url(#colorMinutes)"
                                                                />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                </div>
                                            </div>

                                            <div className="mt-8 grid grid-cols-3 gap-4">
                                                {[
                                                    {
                                                        icon: (
                                                            <BarChart3 className="h-5 w-5 text-white" />
                                                        ),
                                                        label: 'Total Sessions',
                                                        value: mockStats.totalSessions,
                                                    },
                                                    {
                                                        icon: (
                                                            <Clock className="h-5 w-5 text-white" />
                                                        ),
                                                        label: 'Focused Time',
                                                        value: mockStats.focusedTime,
                                                    },
                                                    {
                                                        icon: (
                                                            <Flame className="h-5 w-5 text-white" />
                                                        ),
                                                        label: 'Best Sessions',
                                                        value: mockStats.bestSessions,
                                                    },
                                                    {
                                                        icon: (
                                                            <CheckCircle2 className="h-5 w-5 text-white" />
                                                        ),
                                                        label: 'Tasks completed',
                                                        value: mockStats.tasksCompleted,
                                                    },
                                                ].map((c, i) => (
                                                    <div
                                                        key={i}
                                                        className="rounded-2xl border border-white/12 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,.5)] backdrop-blur-2xl transition-all hover:scale-105 hover:bg-white/10"
                                                    >
                                                        <div className="mb-3 flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                                                                {c.icon}
                                                            </div>
                                                            <span className="text-sm font-medium text-white/80">
                                                                {c.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-4xl font-bold">
                                                            {c.value}
                                                        </p>
                                                    </div>
                                                ))}

                                                <div className="col-span-2 rounded-2xl border border-white/12 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,.5)] backdrop-blur-2xl transition-all hover:scale-105 hover:bg-white/10">
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                                                            <Atom className="h-5 w-5 text-white" />
                                                        </div>
                                                        <span className="text-sm font-medium text-white/80">
                                                            Focus Score
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <p className="text-4xl font-bold">
                                                            {
                                                                mockStats.focusScore
                                                            }
                                                        </p>
                                                        <div className="flex gap-1">
                                                            {[
                                                                1, 2, 3, 4, 5,
                                                            ].map((star) => (
                                                                <div
                                                                    key={star}
                                                                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/30"
                                                                >
                                                                    <div className="h-3 w-3 rounded-full bg-white/20" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent
                                            value="sessions"
                                            className="space-y-4 pb-4"
                                        >
                                            {[
                                                {
                                                    title: 'Morning Study Session',
                                                    time: 'Today, 9:00 AM - 10:25 AM',
                                                    status: {
                                                        label: 'Completed',
                                                        cls: 'border-green-500/30 bg-green-500/15 text-green-400',
                                                    },
                                                    meta: [
                                                        '1h 25m',
                                                        '3 tasks completed',
                                                        '4 Pomodoros',
                                                    ],
                                                },
                                                {
                                                    title: 'Afternoon Focus',
                                                    time: 'Yesterday, 2:00 PM - 3:50 PM',
                                                    status: {
                                                        label: 'Completed',
                                                        cls: 'border-green-500/30 bg-green-500/15 text-green-400',
                                                    },
                                                    meta: [
                                                        '1h 50m',
                                                        '5 tasks completed',
                                                        '4 Pomodoros',
                                                    ],
                                                },
                                                {
                                                    title: 'Evening Review',
                                                    time: 'Yesterday, 7:30 PM - 8:15 PM',
                                                    status: {
                                                        label: 'Completed',
                                                        cls: 'border-green-500/30 bg-green-500/15 text-green-400',
                                                    },
                                                    meta: [
                                                        '45m',
                                                        '2 tasks completed',
                                                        '2 Pomodoros',
                                                    ],
                                                },
                                                {
                                                    title: 'Quick Study Break',
                                                    time: '2 days ago, 11:00 AM - 11:30 AM',
                                                    status: {
                                                        label: 'Partial',
                                                        cls: 'border-yellow-500/30 bg-yellow-500/15 text-yellow-400',
                                                    },
                                                    meta: [
                                                        '30m',
                                                        '1 task completed',
                                                        '1 Pomodoro',
                                                    ],
                                                },
                                            ].map((s, i) => (
                                                <div
                                                    key={i}
                                                    className="rounded-2xl border border-white/12 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,.5)] backdrop-blur-2xl transition-all hover:scale-[1.02] hover:bg-white/10"
                                                >
                                                    <div className="mb-3 flex items-start justify-between">
                                                        <div>
                                                            <h3 className="mb-1 text-lg font-bold text-white">
                                                                {s.title}
                                                            </h3>
                                                            <p className="text-sm text-white/70">
                                                                {s.time}
                                                            </p>
                                                        </div>
                                                        <div
                                                            className={`rounded-xl border px-3 py-1 ${s.status.cls}`}
                                                        >
                                                            <span className="text-sm font-semibold">
                                                                {s.status.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-white/70" />
                                                            <span className="text-white/80">
                                                                {s.meta[0]}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-white/70" />
                                                            <span className="text-white/80">
                                                                {s.meta[1]}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Flame className="h-4 w-4 text-white/70" />
                                                            <span className="text-white/80">
                                                                {s.meta[2]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </TabsContent>
                                    </div>

                                    <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-6 bg-gradient-to-t from-[#0b0b0f] to-transparent" />
                                </div>
                            </Tabs>
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
