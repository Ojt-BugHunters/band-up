import { Test } from '@/lib/api/dto/test';
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
            return 'bg-gradient-to-br from-blue-50 to-white';
        case 'writing':
            return 'bg-gradient-to-br from-emerald-50 to-white';
        case 'listening':
            return 'bg-gradient-to-br from-violet-50 to-white';
        case 'speaking':
            return 'bg-gradient-to-br from-amber-50 to-white';
        default:
            return 'bg-white';
    }
};

const getSkillColor = (skill: string) => {
    switch (skill.toLowerCase()) {
        case 'reading':
            return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'writing':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'listening':
            return 'bg-violet-50 text-violet-700 border-violet-200';
        case 'speaking':
            return 'bg-amber-50 text-amber-700 border-amber-200';
        default:
            return 'bg-gray-50 text-gray-700 border-gray-200';
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export function TestCard({ test }: { test: Test }) {
    return (
        <Card
            className={`${getCardGradient(test.skill)} group flex min-h-[220px] flex-col overflow-hidden border border-gray-200 shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-gray-300 hover:shadow-xl`}
        >
            <CardHeader className="flex-grow pb-3">
                <div className="mb-3 flex items-start justify-between gap-4">
                    <CardTitle className="text-lg leading-tight font-semibold text-gray-900 transition-colors group-hover:text-gray-800">
                        {test.title}
                    </CardTitle>
                    <Badge
                        className={`${getSkillColor(test.skill)} shrink-0 font-medium`}
                    >
                        <BookOpen className="mr-1 h-3 w-3" />
                        {test.skill}
                    </Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {formatDate(test.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {test.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        {test.comments}
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        {test.number_participant}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="mt-auto pt-0">
                <Button
                    size="sm"
                    className="w-full bg-gray-900 py-2.5 font-medium text-white transition-colors group-hover:bg-gray-800 hover:bg-gray-800"
                >
                    <Play className="mr-2 h-4 w-4" />
                    Start Test
                </Button>
            </CardContent>
        </Card>
    );
}
