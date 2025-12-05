import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/lib/service/blog';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentPostsCardProps {
    posts?: BlogPost[];
    className?: string;
    isLoading?: boolean;
    errorMessage?: string;
}

export default function RecentPostsCard({
    posts,
    className,
    isLoading,
    errorMessage,
}: RecentPostsCardProps) {
    const renderPostStatus = (post: BlogPost) =>
        post.publishedDate ? 'Published' : 'Draft';

    const renderContent = () => {
        if (isLoading) {
            return Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={`recent-post-skeleton-${index}`}
                    className="bg-background/50 flex items-center justify-between rounded-lg p-3"
                >
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                        <Skeleton className="h-4 w-10" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                </div>
            ));
        }

        if (errorMessage) {
            return (
                <p className="text-destructive text-sm">{errorMessage}</p>
            );
        }

        if (!posts?.length) {
            return (
                <p className="text-muted-foreground text-sm">
                    No recent posts available.
                </p>
            );
        }

        return posts.map((post) => {
            const status = renderPostStatus(post);
            const views =
                post.numberOfReaders ?? post.numberOfReader ?? 0;
            return (
                <div
                    key={post.id}
                    className="bg-background/50 hover:bg-background flex items-center justify-between rounded-lg p-3 transition-colors"
                >
                    <div className="flex-1">
                        <h4 className="text-foreground line-clamp-1 text-sm font-medium">
                            {post.title}
                        </h4>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {formatDate(post.publishedDate ?? '')}
                        </p>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                        <span className="text-muted-foreground text-xs font-medium">
                            {views.toLocaleString()}
                        </span>
                        <Badge
                            variant={status === 'Published' ? 'default' : 'secondary'}
                            className="text-xs"
                        >
                            {status}
                        </Badge>
                    </div>
                </div>
            );
        });
    };

    return (
        <Card className={`border-border/50 ${className}`}>
            <CardHeader className="pb-4">
                <CardTitle className="text-foreground text-lg font-semibold">
                    Recent Posts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">{renderContent()}</div>
            </CardContent>
        </Card>
    );
}
