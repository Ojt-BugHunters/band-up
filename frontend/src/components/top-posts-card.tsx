import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Post {
    id: number;
    title: string;
    views: number;
    engagement: number;
}

interface TopPostsCardProps {
    posts: Post[];
    className?: string;
}

export default function TopPostsCard({ posts, className }: TopPostsCardProps) {
    return (
        <Card className={`border-border/50 ${className}`}>
            <CardHeader className="pb-4">
                <CardTitle className="text-foreground text-lg font-semibold">
                    Top Performing
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {posts.map((post, index) => (
                        <div
                            key={post.id}
                            className="border-border/50 flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                        >
                            <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold">
                                {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-foreground line-clamp-2 text-sm font-medium">
                                    {post.title}
                                </h4>
                                <div className="text-muted-foreground mt-2 flex gap-3 text-xs">
                                    <span>
                                        👁️ {post.views.toLocaleString()}
                                    </span>
                                    <span>💬 {post.engagement}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
