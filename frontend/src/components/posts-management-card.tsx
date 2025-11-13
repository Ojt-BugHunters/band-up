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

interface Post {
    id: number;
    title: string;
    date: string;
    views: number;
    status: string;
}

interface PostsManagementCardProps {
    posts: Post[];
}

export default function PostsManagementCard({
    posts,
}: PostsManagementCardProps) {
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
                        <div className="space-y-3">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="border-border hover:bg-accent flex items-center justify-between rounded-lg border p-4 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h3 className="text-foreground font-semibold">
                                            {post.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm">
                                            {post.date}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-foreground text-sm font-medium">
                                                {post.views}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                views
                                            </p>
                                        </div>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                post.status === 'Published'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                        >
                                            {post.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Tab 2: Admin Panel */}
                    <TabsContent value="admin-panel" className="mt-6">
                        <PostsTable />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
