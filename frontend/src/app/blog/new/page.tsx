'use client';
import BlogForm from './blog-form';

export default function CreateBlogPage() {
    return (
        <div className="mx-auto mt-14 p-8">
            <BlogForm mode="create" />
        </div>
    );
}
