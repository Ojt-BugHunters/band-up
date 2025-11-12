import StatCard from '@/components/stat-card';
import ChartCard from '@/components/chart-card';
import RecentPostsCard from '@/components/recent-posts-card';
import TopPostsCard from '@/components/top-posts-card';
import PostsManagementCard from '@/components/posts-management-card';

export default function AdminBlogPage() {
    // Mock data for statistics
    const viewsData = [
        { date: 'Mon', views: 2400 },
        { date: 'Tue', views: 1398 },
        { date: 'Wed', views: 9800 },
        { date: 'Thu', views: 3908 },
        { date: 'Fri', views: 4800 },
        { date: 'Sat', views: 3800 },
        { date: 'Sun', views: 4300 },
    ];

    const engagementData = [
        { name: 'Comments', value: 240 },
        { name: 'Shares', value: 180 },
        { name: 'Likes', value: 320 },
        { name: 'Bookmarks', value: 150 },
    ];

    const recentPosts = [
        {
            id: 1,
            title: 'Getting Started with React 19',
            date: '2 hours ago',
            views: 1240,
            status: 'Published',
        },
        {
            id: 2,
            title: 'Advanced TypeScript Patterns',
            date: '1 day ago',
            views: 892,
            status: 'Published',
        },
        {
            id: 3,
            title: 'Building Scalable APIs',
            date: '3 days ago',
            views: 2104,
            status: 'Draft',
        },
    ];

    const topPosts = [
        {
            id: 1,
            title: 'Next.js 15 Features Explained',
            views: 5420,
            engagement: 342,
        },
        {
            id: 2,
            title: 'Web Performance Optimization',
            views: 4890,
            engagement: 298,
        },
        { id: 3, title: 'CSS Grid Mastery', views: 4120, engagement: 267 },
    ];

    return (
        <div className="bg-background min-h-screen p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-foreground mb-2 text-3xl font-bold">
                        Blog Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Track your blogs performance and engagement metrics
                    </p>
                </div>

                {/* KPI Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Views"
                        value="45.2K"
                        change="+12.5%"
                        icon="📊"
                    />
                    <StatCard
                        title="Total Posts"
                        value="128"
                        change="+4 this month"
                        icon="📝"
                    />
                    <StatCard
                        title="Avg. Engagement"
                        value="8.2%"
                        change="+2.1%"
                        icon="💬"
                    />
                    <StatCard
                        title="Avg. Read Time"
                        value="4.5 min"
                        change="+0.8 min"
                        icon="⏱️"
                    />
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Views Chart - Full width on left */}
                    <ChartCard
                        title="Views Over Time"
                        className="lg:col-span-2"
                        data={viewsData}
                        type="line"
                    />

                    {/* Engagement Breakdown - Right side */}
                    <ChartCard
                        title="Engagement Breakdown"
                        data={engagementData}
                        type="bar"
                        className="lg:row-span-1"
                    />

                    {/* Recent Posts - Left side */}
                    <RecentPostsCard
                        posts={recentPosts}
                        className="lg:col-span-2"
                    />

                    {/* Top Posts - Right side */}
                    <TopPostsCard posts={topPosts} className="lg:col-span-1" />

                    {/* Posts Management Card with tabs */}
                    <PostsManagementCard posts={recentPosts} />
                </div>
            </div>
        </div>
    );
}
