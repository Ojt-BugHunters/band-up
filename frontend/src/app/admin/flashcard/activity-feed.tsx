'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain, CreditCard, Users, TrendingUp } from 'lucide-react';

const activities = [
    {
        id: 1,
        type: 'deck',
        user: 'Sarah Johnson',
        action: 'created a new deck',
        target: 'Spanish Vocabulary',
        time: '2 minutes ago',
        icon: Brain,
    },
    {
        id: 2,
        type: 'card',
        user: 'Mike Chen',
        action: 'mastered 50 cards in',
        target: 'Biology 101',
        time: '15 minutes ago',
        icon: CreditCard,
    },
    {
        id: 3,
        type: 'user',
        user: 'Emily Davis',
        action: 'joined the platform',
        target: '',
        time: '1 hour ago',
        icon: Users,
    },
    {
        id: 4,
        type: 'achievement',
        user: 'Alex Rodriguez',
        action: 'reached a 30-day streak',
        target: '',
        time: '2 hours ago',
        icon: TrendingUp,
    },
    {
        id: 5,
        type: 'deck',
        user: 'Jessica Kim',
        action: 'created a new deck',
        target: 'React Hooks',
        time: '3 hours ago',
        icon: Brain,
    },
    {
        id: 6,
        type: 'card',
        user: 'David Lee',
        action: 'reviewed 120 cards',
        target: '',
        time: '4 hours ago',
        icon: CreditCard,
    },
];

export function ActivityFeed() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    Latest user actions and milestones
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {activities.map((activity) => {
                            const Icon = activity.icon;
                            return (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-4"
                                >
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>
                                            <Icon className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm">
                                            <span className="font-medium">
                                                {activity.user}
                                            </span>{' '}
                                            {activity.action}
                                            {activity.target && (
                                                <span className="font-medium">
                                                    {' '}
                                                    {activity.target}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {activity.time}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
