import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    change: string;
    icon: LucideIcon;
    isPositive?: boolean;
}

export const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    isPositive = true,
}: StatCardProps) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-muted-foreground text-xs">
                    <span
                        className={
                            isPositive ? 'text-green-500' : 'text-red-500'
                        }
                    >
                        {isPositive ? '+' : '-'}
                        {change}
                    </span>{' '}
                    from last month
                </p>
            </CardContent>
        </Card>
    );
};
