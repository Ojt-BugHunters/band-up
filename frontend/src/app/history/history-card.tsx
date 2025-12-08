'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Calendar,
    Clock,
    Award,
    CheckCircle2,
    XCircle,
    Circle,
    ChevronRight,
} from 'lucide-react';
import { AttemptHistoryItem } from '@/lib/service/attempt';
import Link from 'next/link';

interface HistoryCardProps {
    item: AttemptHistoryItem;
}

export function HistoryCard({ item }: HistoryCardProps) {
    const { attempt, test } = item;

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'ENDED':
                return 'bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400';
            case 'STARTED':
                return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400';
            case 'PENDING':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400';
            default:
                return 'bg-gray-500/10 text-gray-600 border-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case 'ENDED':
                return <CheckCircle2 className="h-3 w-3" />;
            case 'STARTED':
                return <Circle className="h-3 w-3" />;
            case 'PENDING':
                return <XCircle className="h-3 w-3" />;
            default:
                return <Circle className="h-3 w-3" />;
        }
    };

    const getSkillColor = (skill: string) => {
        switch (skill) {
            case 'Listening':
                return 'bg-purple-500/10 text-purple-700 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-300';
            case 'Reading':
                return 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-300';
            case 'Writing':
                return 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-300';
            case 'Speaking':
                return 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300';
            default:
                return 'bg-gray-500/10 text-gray-700 border-gray-500/20 dark:bg-gray-500/20 dark:text-gray-300';
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy':
                return 'bg-green-500/10 text-green-700 border-green-500/20 dark:bg-green-500/20 dark:text-green-300';
            case 'Medium':
                return 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300';
            case 'Hard':
                return 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-300';
            default:
                return 'bg-gray-500/10 text-gray-700 border-gray-500/20 dark:bg-gray-500/20 dark:text-gray-300';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} mins`;
    };

    const getBandColor = (band: number | null) => {
        if (!band) return 'text-gray-500';
        if (band >= 7) return 'text-green-600 dark:text-green-400';
        if (band >= 5) return 'text-amber-600 dark:text-amber-400';
        return 'text-rose-600 dark:text-rose-400';
    };

    return (
        <Link href={`/history/${attempt.id}`}>
            <Card
                className={cn(
                    'group relative cursor-pointer overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                    'hover:border-primary/50',
                    'before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
                    'before:transition-transform before:duration-700 hover:before:translate-x-full',
                )}
            >
                <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-rose-500/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                <div className="from-primary/80 to-primary/60 text-primary-foreground pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-r px-4 py-2 text-xs font-medium shadow-inner transition-transform duration-300 group-hover:translate-y-0">
                    <div className="flex items-center justify-center gap-1">
                        <span>See detail</span>
                        <ChevronRight className="h-3 w-3" />
                    </div>
                </div>

                <div className="relative space-y-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                            <h3 className="group-hover:text-primary line-clamp-2 text-lg leading-tight font-semibold text-pretty transition-colors">
                                {test.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    className={cn(
                                        'text-xs',
                                        getSkillColor(test.skillName),
                                    )}
                                >
                                    {test.skillName}
                                </Badge>
                                <Badge
                                    className={cn(
                                        'text-xs',
                                        getDifficultyColor(test.difficult),
                                    )}
                                >
                                    {test.difficult}
                                </Badge>
                            </div>
                        </div>

                        <Badge
                            className={cn(
                                'flex items-center gap-1 text-xs font-semibold',
                                getStatusColor(attempt.status),
                            )}
                        >
                            {getStatusIcon(attempt.status)}
                            {attempt.status}
                        </Badge>
                    </div>

                    {attempt.overallBand !== null && (
                        <div className="from-primary/5 to-primary/10 relative rounded-lg bg-gradient-to-br p-4 shadow-inner">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Award className="text-primary h-5 w-5" />
                                    <span className="text-muted-foreground text-sm font-medium">
                                        Overall Band
                                    </span>
                                </div>
                                <div
                                    className={cn(
                                        'text-3xl font-bold tabular-nums',
                                        getBandColor(attempt.overallBand),
                                    )}
                                >
                                    {attempt.overallBand.toFixed(1)}
                                </div>
                            </div>
                            {attempt.score !== null && (
                                <div className="text-muted-foreground mt-2 text-xs">
                                    Score: {attempt.score}%
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                                {formatDate(attempt.startAt)}
                            </span>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>{formatDuration(test.durationSeconds)}</span>
                        </div>
                    </div>

                    {attempt.attemptSections.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-muted-foreground text-xs font-medium">
                                Sections Completed
                            </div>
                            <div className="flex gap-1">
                                {attempt.attemptSections.map((section) => (
                                    <div
                                        key={section.id}
                                        className={cn(
                                            'h-1.5 flex-1 rounded-full',
                                            section.status === 'ENDED'
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                : 'bg-muted',
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </Link>
    );
}
