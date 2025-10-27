'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Headphones, Play } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface DictationCardProps {
    dictation: {
        id: string;
        title: string;
        duration: number;
        difficulty: 'Easy' | 'Medium' | 'Hard';
        completions: number;
        createdAt: Date;
    };
}

export default function DictationCard({ dictation }: DictationCardProps) {
    const difficultyColors = {
        Easy: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-emerald-500 shadow-emerald-500/20',
        Medium: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-amber-500 shadow-amber-500/20',
        Hard: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white border-rose-600 shadow-rose-500/20',
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} min`;
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Link href={`/dictation/${dictation.id}`} className="group block">
            <Card className="from-background dark:from-background relative h-full overflow-hidden border-2 bg-gradient-to-br via-violet-50/30 to-blue-50/30 transition-all duration-500 hover:-translate-y-2 hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/20 dark:via-violet-950/20 dark:to-blue-950/20 dark:hover:shadow-violet-400/10">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-400/20 to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

                <CardHeader className="relative space-y-3 pb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs font-medium transition-colors duration-300 group-hover:text-violet-600 dark:group-hover:text-violet-400">
                            {formatDate(dictation.createdAt)}
                        </span>
                        <Badge
                            variant="outline"
                            className={cn(
                                'border-2 text-xs font-semibold shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl',
                                difficultyColors[dictation.difficulty],
                            )}
                        >
                            {dictation.difficulty}
                        </Badge>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="relative rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 p-3 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-violet-500/40">
                            <Headphones className="h-5 w-5 text-white" />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-400 to-blue-400 opacity-0 blur-md transition-opacity duration-300 group-hover:animate-pulse group-hover:opacity-50" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <CardTitle className="line-clamp-2 text-lg leading-tight font-bold transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent dark:group-hover:from-violet-400 dark:group-hover:to-blue-400">
                                {dictation.title}
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="relative space-y-4 pt-0">
                    <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-violet-50/50 via-blue-50/50 to-purple-50/50 p-3 text-sm transition-all duration-300 group-hover:from-violet-100/70 group-hover:via-blue-100/70 group-hover:to-purple-100/70 group-hover:shadow-md dark:from-violet-950/30 dark:via-blue-950/30 dark:to-purple-950/30 dark:group-hover:from-violet-900/40 dark:group-hover:via-blue-900/40 dark:group-hover:to-purple-900/40">
                        <div className="text-muted-foreground flex items-center gap-2 transition-colors duration-300 group-hover:text-violet-600 dark:group-hover:text-violet-400">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                                {formatDuration(dictation.duration)}
                            </span>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">
                                {dictation.completions.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-violet-100 via-blue-100 to-purple-100 shadow-inner dark:from-violet-950 dark:via-blue-950 dark:to-purple-950">
                        <div
                            className="h-full bg-gradient-to-r from-violet-600 via-blue-600 to-purple-600 shadow-lg shadow-violet-500/50 transition-all duration-700 ease-out group-hover:w-full"
                            style={{ width: '0%' }}
                        />
                        <div className="group-hover:animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                    </div>

                    <div className="flex items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <Play className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                        <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-xs font-semibold tracking-wider text-transparent uppercase dark:from-violet-400 dark:to-blue-400">
                            Start Practice
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
