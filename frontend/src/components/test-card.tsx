import { TestOverview } from '@/lib/service/test';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
    BookOpen,
    Calendar,
    Clock,
    MessageSquare,
    Play,
    Users,
} from 'lucide-react';
import { Button } from './ui/button';

const getCardGradient = (skill: string) => {
    switch (skill.toLowerCase()) {
        case 'reading':
            return 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:bg-gradient-to-br dark:from-blue-900/40 dark:via-slate-800/50 dark:to-indigo-900/30';
        case 'writing':
            return 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-emerald-900/40 dark:via-slate-800/50 dark:to-teal-900/30';
        case 'listening':
            return 'bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:bg-gradient-to-br dark:from-violet-900/40 dark:via-slate-800/50 dark:to-purple-900/30';
        case 'speaking':
            return 'bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:bg-gradient-to-br dark:from-amber-900/40 dark:via-slate-800/50 dark:to-orange-900/30';
        default:
            return 'bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:bg-gradient-to-br dark:from-slate-800/40 dark:via-slate-800/50 dark:to-gray-800/30';
    }
};

const getSkillColor = (skill: string) => {
    switch (skill.toLowerCase()) {
        case 'reading':
            return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400/30';
        case 'writing':
            return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30';
        case 'listening':
            return 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-400/30';
        case 'speaking':
            return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-400/30';
        default:
            return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-400/30';
    }
};

const getHoverShadow = (skill: string) => {
    switch (skill.toLowerCase()) {
        case 'reading':
            return 'hover:shadow-blue-200/50 dark:hover:shadow-blue-500/20';
        case 'writing':
            return 'hover:shadow-emerald-200/50 dark:hover:shadow-emerald-500/20';
        case 'listening':
            return 'hover:shadow-violet-200/50 dark:hover:shadow-violet-500/20';
        case 'speaking':
            return 'hover:shadow-amber-200/50 dark:hover:shadow-amber-500/20';
        default:
            return 'hover:shadow-slate-200/50 dark:hover:shadow-slate-500/20';
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export function TestCard({ test }: { test: TestOverview }) {
    return (
        <Card
            className={`${getCardGradient(test.skill)} group flex min-h-[220px] flex-col overflow-hidden border border-slate-200 shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-slate-300 hover:shadow-xl ${getHoverShadow(test.skill)} dark:border-border dark:hover:border-border/80`}
        >
            <CardHeader className="flex-grow pb-3">
                <div className="mb-3 flex items-start justify-between gap-4">
                    <CardTitle className="dark:text-foreground line-clamp-2 min-h-[4.5rem] text-lg leading-tight font-semibold text-slate-900 transition-colors">
                        {test.title}
                    </CardTitle>
                    <Badge
                        className={`${getSkillColor(test.skill)} shrink-0 font-medium`}
                    >
                        <BookOpen className="mr-1 h-3 w-3" />
                        {test.skill}
                    </Badge>
                </div>
                <div className="dark:text-muted-foreground grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                        <Calendar className="dark:text-muted-foreground/80 h-4 w-4 text-slate-500" />
                        {formatDate(test.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="dark:text-muted-foreground/80 h-4 w-4 text-slate-500" />
                        {test.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageSquare className="dark:text-muted-foreground/80 h-4 w-4 text-slate-500" />
                        {test.comments}
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="dark:text-muted-foreground/80 h-4 w-4 text-slate-500" />
                        {test.number_participant}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
                <Button
                    size="sm"
                    className="dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 w-full bg-slate-900 py-2.5 font-medium text-white transition-all hover:bg-slate-800 hover:shadow-lg"
                >
                    <Play className="mr-2 h-4 w-4" />
                    Start Test
                </Button>
            </CardContent>
        </Card>
    );
}
