import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BookOpen, Calendar, Clock, Play, Users } from 'lucide-react';
import { Button } from './ui/button';
import type { Dictation } from '@/lib/service/dictation';

const getCardGradient = (skill: string) => {
    switch (skill.toLowerCase()) {
        case 'reading':
            return 'from-blue-500/10 via-blue-400/5 to-indigo-500/10 dark:from-blue-500/20 dark:via-blue-400/10 dark:to-indigo-500/20';
        case 'writing':
            return 'from-emerald-500/10 via-teal-400/5 to-teal-500/10 dark:from-emerald-500/20 dark:via-teal-400/10 dark:to-teal-500/20';
        case 'listening':
            return 'from-violet-500/10 via-purple-400/5 to-indigo-500/10 dark:from-violet-500/20 dark:via-purple-400/10 dark:to-indigo-500/20';
        case 'speaking':
            return 'from-amber-500/10 via-orange-400/5 to-orange-500/10 dark:from-amber-500/20 dark:via-orange-400/10 dark:to-orange-500/20';
        default:
            return 'from-gray-400/10 via-white/5 to-gray-400/10 dark:from-slate-500/20 dark:via-slate-400/10 dark:to-gray-500/20';
    }
};

const getSkillColor = (skill: string) => {
    switch (skill.toLowerCase()) {
        case 'reading':
            return 'bg-blue-500/90 text-white border-blue-400/50 dark:bg-blue-600/80 dark:border-blue-500/50';
        case 'writing':
            return 'bg-emerald-500/90 text-white border-emerald-400/50 dark:bg-emerald-600/80 dark:border-emerald-500/50';
        case 'listening':
            return 'bg-violet-500/90 text-white border-violet-400/50 dark:bg-violet-600/80 dark:border-violet-500/50';
        case 'speaking':
            return 'bg-amber-500/90 text-white border-amber-400/50 dark:bg-amber-600/80 dark:border-amber-500/50';
        default:
            return 'bg-gray-500/90 text-white border-gray-400/50 dark:bg-gray-600/80 dark:border-gray-500/50';
    }
};

const getHoverGlow = (skill: string) => {
    switch (skill.toLowerCase()) {
        case 'reading':
            return 'hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] dark:hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.2)]';
        case 'writing':
            return 'hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] dark:hover:shadow-[0_20px_40px_-10px_rgba(5,150,105,0.2)]';
        case 'listening':
            return 'hover:shadow-[0_20px_40px_-10px_rgba(139,92,246,0.3)] dark:hover:shadow-[0_20px_40px_-10px_rgba(124,58,255,0.2)]';
        case 'speaking':
            return 'hover:shadow-[0_20px_40px_-10px_rgba(217,119,6,0.3)] dark:hover:shadow-[0_20px_40px_-10px_rgba(180,83,9,0.2)]';
        default:
            return 'hover:shadow-[0_20px_40px_-10px_rgba(107,114,128,0.3)] dark:hover:shadow-[0_20px_40px_-10px_rgba(75,85,99,0.2)]';
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatDuration = (durationSeconds: number) => {
    const minutes = Math.floor(durationSeconds / 60);
    return `${minutes} min`;
};

export function TestCard({ test }: { test: Dictation }) {
    return (
        <Card
            className={`bg-gradient-to-br ${getCardGradient(test.skillName)} group relative flex min-h-[220px] flex-col overflow-hidden rounded-xl border border-white/30 backdrop-blur-sm transition-all duration-500 ease-out hover:border-white/50 dark:border-white/10 dark:hover:border-white/20 ${getHoverGlow(test.skillName)}`}
        >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <CardHeader className="relative z-10 flex-grow pb-3">
                <div className="mb-3 flex items-start justify-between gap-4">
                    <CardTitle className="line-clamp-2 min-h-[4.5rem] text-lg font-semibold text-slate-900 transition-all duration-300 group-hover:text-slate-950 dark:text-white dark:group-hover:text-white/95">
                        {test.title}
                    </CardTitle>
                    <Badge
                        className={`${getSkillColor(test.skillName)} shrink-0 border font-medium backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                    >
                        <BookOpen className="mr-1 h-3 w-3" />
                        {test.skillName}
                    </Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600 transition-colors duration-300 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-slate-500 transition-colors duration-300 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-400" />
                        {formatDate(test.createAt)}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-slate-500 transition-colors duration-300 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-400" />
                        {formatDuration(test.durationSeconds)}
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-slate-500 transition-colors duration-300 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-400" />
                        {test.numberOfPeople}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative z-10 mt-auto pt-0">
                <Button
                    size="sm"
                    className="group/btn relative w-full overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 py-2.5 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 dark:from-white dark:to-slate-100 dark:text-slate-900"
                >
                    <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-[100%]" />
                    <Play className="mr-2 h-4 w-4 transition-transform duration-300 group-hover/btn:scale-125" />
                    <span className="relative">Start Test</span>
                </Button>
            </CardContent>
        </Card>
    );
}
