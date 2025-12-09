'use client';

import { useParams } from 'next/navigation';
import BlogForm from '@/app/blog/new/blog-form';
import { useGetBlogDetail } from '@/lib/service/blog';

export default function EditBlogPage() {
    const params = useParams<{ id: string }>();
    const blogId = params?.id;
    const {
        data: blog,
        isLoading,
        error,
    } = useGetBlogDetail(blogId ?? '');

    if (!blogId) {
        return (
            <div className="p-6">
                <p className="text-destructive text-sm">
                    Blog ID is missing.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="p-6">
                <p className="text-muted-foreground text-sm">
                    Loading blog details...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <p className="text-destructive text-sm">
                    Failed to load blog: {error instanceof Error ? error.message : 'Unknown error'}
                </p>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="p-6">
                <p className="text-destructive text-sm">
                    Blog not found.
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto mt-14 p-8">
            <BlogForm
                mode="update"
                initialValues={{
                    id: blog.id,
                    title: blog.title,
                    description: blog.content ?? '',
                    topics: blog.tags ?? [],
                }}
                submitText="Update Blog"
            />
        </div>
    );
}
