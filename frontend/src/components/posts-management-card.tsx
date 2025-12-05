'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostsTable } from '@/components/posts-table';
import type { BlogPost } from '@/lib/service/blog';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface PostsManagementCardProps {
    posts?: BlogPost[];
    isLoading?: boolean;
    errorMessage?: string;
}

export default function PostsManagementCard({
    posts,
    isLoading,
    errorMessage,
}: PostsManagementCardProps) {
    const renderStatus = (post: BlogPost) =>
        post.publishedDate ? 'Published' : 'Draft';
    const renderViews = (post: BlogPost) =>
        (post.numberOfReaders ?? post.numberOfReader ?? 0).toLocaleString();

    const renderPostsList = () => {
        if (isLoading) {
            return Array.from({ length: 3 }).map((_, index) => (
                <div key={`posts-management-skeleton-${index}`} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                    <div className="flex items-center gap-6">
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-6 w-20" />
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
                    No posts found.
                </p>
            );
        }

        return posts.map((post) => (
            <div
                key={post.id}
                className="border-border hover:bg-accent flex items-center justify-between rounded-lg border p-4 transition-colors"
            >
                <div className="flex-1">
                    <h3 className="text-foreground font-semibold">
                        {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        {formatDate(post.publishedDate ?? '')}
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-foreground text-sm font-medium">
                            {renderViews(post)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                            views
                        </p>
                    </div>
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${renderStatus(post) === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                    >
                        {renderStatus(post)}
                    </span>
                </div>
            </div>
        ));
    };

    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Posts Management</CardTitle>
                <CardDescription>
                    Manage and view all your blog posts
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="all-posts" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="all-posts">All Posts</TabsTrigger>
                        <TabsTrigger value="admin-panel">
                            Admin Panel
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: All Posts */}
                    <TabsContent value="all-posts" className="space-y-4">
                        <div className="space-y-3">{renderPostsList()}</div>
                    </TabsContent>

                    {/* Tab 2: Admin Panel */}
                    <TabsContent value="admin-panel" className="mt-6">
                        <PostsTable
                            posts={posts}
                            isLoading={isLoading}
                            errorMessage={errorMessage}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
