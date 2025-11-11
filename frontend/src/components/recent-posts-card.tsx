import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Post {
    id: number;
    title: string;
    date: string;
    views: number;
    status: string;
}

interface RecentPostsCardProps {
    posts: Post[];
    className?: string;
}

export default function RecentPostsCard({
    posts,
    className,
}: RecentPostsCardProps) {
    return (
        <Card className={`border-border/50 ${className}`}>
            <CardHeader className="pb-4">
                <CardTitle className="text-foreground text-lg font-semibold">
                    Recent Posts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-background/50 hover:bg-background flex items-center justify-between rounded-lg p-3 transition-colors"
                        >
                            <div className="flex-1">
                                <h4 className="text-foreground line-clamp-1 text-sm font-medium">
                                    {post.title}
                                </h4>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    {post.date}
                                </p>
                            </div>
                            <div className="ml-4 flex items-center gap-2">
                                <span className="text-muted-foreground text-xs font-medium">
                                    {post.views.toLocaleString()}
                                </span>
                                <Badge
                                    variant={
                                        post.status === 'Published'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    className="text-xs"
                                >
                                    {post.status}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
