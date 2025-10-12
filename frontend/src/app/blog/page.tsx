'use client';

import BlogSideBar from '@/components/blog-sidebar';

export default function BlogPage() {
    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="container mx-auto px-4 py-6">
                    <aside className="hidden lg:col-span-2 lg:block">
                        <BlogSideBar />
                    </aside>
                </div>
            </div>
        </div>
    );
}
