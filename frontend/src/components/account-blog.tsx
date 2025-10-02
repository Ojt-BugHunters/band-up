'use client';

import { Eye, FileText } from 'lucide-react';
import { mockAccountBlogs } from '../../constants/sample-data';
import { CardContent } from './ui/card';
import { Button } from './ui/button';
import { useMemo, useState } from 'react';
import { PaginationState } from '@tanstack/react-table';
import { PaginationControl } from './ui/pagination-control';

const colors = [
    { bg: 'bg-blue-100', text: 'text-blue-600' },
    { bg: 'bg-green-100', text: 'text-green-600' },
    { bg: 'bg-rose-100', text: 'text-rose-600' },
    { bg: 'bg-amber-100', text: 'text-amber-600' },
    { bg: 'bg-teal-100', text: 'text-teal-600' },
];

export default function AccountBlogSection() {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const [pagination, setPagination] = useState<PaginationState>({
        pageSize: 6,
        pageIndex: 0,
    });

    const paginationAccountBlogs = useMemo(() => {
        const start = pagination.pageIndex * pagination.pageSize;
        const end = start + pagination.pageSize;
        return mockAccountBlogs.slice(start, end);
    }, [pagination]);

    return (
        <CardContent>
            <div className="space-y-4">
                {paginationAccountBlogs.map((blog) => (
                    <div
                        key={blog.id}
                        className="rounded-lg border p-4 transition-colors hover:bg-zinc-50"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${color.bg}`}
                                >
                                    <FileText
                                        className={`h-5 w-5 ${color.text}`}
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-zinc-900">
                                        {blog.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-zinc-600">
                                        {blog.description}
                                    </p>
                                    <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                                        <span>Uploaded on {blog.date}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white text-zinc-600"
                                >
                                    <Eye className="mr-1 h-4 w-4" />
                                    Read
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div>
                <PaginationControl
                    className="mt-6"
                    itemCount={mockAccountBlogs.length}
                    pagination={pagination}
                    setPagination={setPagination}
                />
            </div>
        </CardContent>
    );
}
