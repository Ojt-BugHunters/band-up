import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Globe,
    Info,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { mockLeaderboardData } from '../../../constants/sample-data';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TimePeriod } from './page';

interface LeaderBoardProps {
    showLeaderboard: boolean;
    setShowLeaderboard: (show: boolean) => void;
    leaderboardPeriod: TimePeriod;
    setLeaderboardPeriod: (p: TimePeriod) => void;
    navigateLeaderboardDate: (direction: 'prev' | 'next') => void;
    leaderboardDate: Date;
    formatLeaderboardDate: (leaderboardDate: Date) => string;
}

export function LeaderBoard({
    showLeaderboard,
    setShowLeaderboard,
    leaderboardPeriod,
    setLeaderboardPeriod,
    navigateLeaderboardDate,
    leaderboardDate,
    formatLeaderboardDate,
}: LeaderBoardProps) {
    return (
        <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
            <DialogContent className="border-zinc-700/50 bg-zinc-900/95 p-0 text-white shadow-2xl shadow-black/40 backdrop-blur-xl sm:max-w-2xl [&>button]:hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex max-h-[85vh] flex-col"
                >
                    <div className="border-b border-zinc-700/50 bg-zinc-900/50 p-6 backdrop-blur-md">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 border-b-2 border-white pb-2">
                                    <Globe className="h-5 w-5" />
                                    <span className="text-lg font-semibold">
                                        Global
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-2.5 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-700/80">
                                    <Info className="h-4 w-4 text-white/70" />
                                </button>
                                <button
                                    onClick={() =>
                                        setLeaderboardPeriod('daily')
                                    }
                                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                        leaderboardPeriod === 'daily'
                                            ? 'scale-105 bg-white text-black shadow-xl shadow-white/20'
                                            : 'border border-zinc-700/50 bg-zinc-800/80 text-white/80 shadow-lg shadow-black/20 hover:scale-105 hover:bg-zinc-700/80 hover:text-white'
                                    }`}
                                >
                                    Daily
                                </button>
                                <button
                                    onClick={() =>
                                        setLeaderboardPeriod('weekly')
                                    }
                                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                        leaderboardPeriod === 'weekly'
                                            ? 'scale-105 bg-white text-black shadow-xl shadow-white/20'
                                            : 'border border-zinc-700/50 bg-zinc-800/80 text-white/80 shadow-lg shadow-black/20 hover:scale-105 hover:bg-zinc-700/80 hover:text-white'
                                    }`}
                                >
                                    Weekly
                                </button>
                                <button
                                    onClick={() =>
                                        setLeaderboardPeriod('monthly')
                                    }
                                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                        leaderboardPeriod === 'monthly'
                                            ? 'scale-105 bg-white text-black shadow-xl shadow-white/20'
                                            : 'border border-zinc-700/50 bg-zinc-800/80 text-white/80 shadow-lg shadow-black/20 hover:scale-105 hover:bg-zinc-700/80 hover:text-white'
                                    }`}
                                >
                                    Monthly
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => navigateLeaderboardDate('prev')}
                                className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-2.5 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-110 hover:bg-zinc-700/80"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="min-w-[140px] text-center text-base font-medium">
                                {formatLeaderboardDate(leaderboardDate)}
                            </span>
                            <button
                                onClick={() => navigateLeaderboardDate('next')}
                                className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-2.5 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-110 hover:bg-zinc-700/80"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="relative flex-1 overflow-hidden">
                        <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-8 bg-gradient-to-b from-zinc-900/95 to-transparent" />

                        <div
                            className="h-[500px] overflow-y-auto scroll-smooth px-6 py-4"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#52525b #181818',
                            }}
                        >
                            <div className="space-y-2">
                                <div className="sticky top-0 z-10 grid grid-cols-[60px_1fr_100px_40px] gap-4 border-b border-zinc-800/50 bg-zinc-900/95 px-4 py-3 text-xs font-semibold tracking-wider text-white/60 uppercase backdrop-blur-md">
                                    <span>#</span>
                                    <span>User</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Time
                                    </span>
                                    <span></span>
                                </div>

                                {mockLeaderboardData.map((user, index) => (
                                    <motion.div
                                        key={user.rank}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: index * 0.03,
                                            duration: 0.3,
                                        }}
                                        className="grid cursor-pointer grid-cols-[60px_1fr_100px_40px] items-center gap-4 rounded-xl border border-zinc-700/40 bg-zinc-800/60 px-4 py-4 shadow-lg shadow-black/10 backdrop-blur-md transition-all hover:scale-[1.02] hover:border-zinc-600/60 hover:bg-zinc-800/80 hover:shadow-xl hover:shadow-black/20"
                                    >
                                        <div className="flex items-center gap-2">
                                            {user.rankChange === 'up' && (
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                                                    <TrendingUp className="h-3 w-3 text-green-400" />
                                                </div>
                                            )}
                                            {user.rankChange === 'down' && (
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20">
                                                    <TrendingDown className="h-3 w-3 text-red-400" />
                                                </div>
                                            )}
                                            <span
                                                className={`text-sm font-bold ${user.rank <= 3 ? 'text-yellow-400' : 'text-white'}`}
                                            >
                                                {user.rank}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-zinc-700/50 shadow-md shadow-black/20">
                                                <AvatarFallback className="bg-zinc-700/80 text-xs font-semibold text-white">
                                                    {user.avatar}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex min-w-0 flex-col">
                                                <div className="flex items-center gap-2">
                                                    {user.country && (
                                                        <span className="text-base">
                                                            {user.country}
                                                        </span>
                                                    )}
                                                    <span className="truncate text-sm font-medium text-white">
                                                        {user.username}
                                                    </span>
                                                </div>
                                                {user.status && (
                                                    <span className="truncate text-xs text-white/50">
                                                        {user.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <span className="text-sm font-semibold text-white">
                                            {user.studyTime}
                                        </span>

                                        <div className="flex items-center justify-center">
                                            <div className="rounded-lg border border-zinc-600/30 bg-zinc-700/50 p-1.5 backdrop-blur-sm">
                                                <Globe className="h-4 w-4 text-white/70" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-8 bg-gradient-to-t from-zinc-900/95 to-transparent" />
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
