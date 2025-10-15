'use client';

import { BlogCard } from '@/components/blog-card';
import { FeaturedCarousel } from '@/components/feature-carousel';
import { blogPosts, fetchTags } from '../../../constants/sample-data';
import { Highlight } from '@/components/ui/highlight';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AsyncSelect } from '@/components/ui/async-select';
import { Tag } from '@/lib/api/dto/category';

export default function BlogListPage() {
    const [search, setSearch] = useState('');
    const [categoryName, setCategoryName] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

    const filteredBlogs = useMemo(() => {
        return blogPosts
            .filter((post) => {
                const byTag =
                    !categoryName ||
                    categoryName === 'All' ||
                    (post.tags ?? []).some((t: Tag) => t.name === categoryName);
                if (!byTag) return false;

                if (!search) return true;

                const inTitle = post.title.includes(search);
                const inSubContent = post.subContent || ''.includes(search);
                const inAuthor = post.author?.name || ''.includes(search);
                const inTagNames = (post.tags || []).some((t) =>
                    t.name.includes(search),
                );

                return inTitle || inSubContent || inAuthor || inTagNames;
            })
            .sort((a, b) => {
                const da = new Date(a.publishedDate).getTime();
                const db = new Date(b.publishedDate).getTime();
                return sortOrder === 'latest' ? db - da : da - db;
            });
    }, [categoryName, sortOrder, search]);

    return (
        <div className="bg-background min-h-screen p-8">
            <section className="mt-8 px-4 pt-25 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-12 text-center">
                        <h2 className="text-foreground mb-6 text-3xl font-bold text-balance md:text-6xl">
                            IELTS Learning Hub
                        </h2>
                        <p className="text-muted-foreground mx-auto max-w-2xl text-xl leading-relaxed text-pretty">
                            Explore{' '}
                            <Highlight className="bg-sky-400 text-black dark:text-white">
                                expert insights, topic analyses, and practice
                                tools
                            </Highlight>{' '}
                            built to sharpen your IELTS skills — for both
                            Academic and General Training.
                        </p>
                    </div>
                    <FeaturedCarousel />
                </div>
            </section>

            <div className="mx-auto max-w-7xl">
                <div className="mt-4 mb-8 flex items-center justify-between">
                    <h2 className="text-foreground text-3xl font-bold">
                        Latest Articles
                    </h2>
                </div>

                <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by title, content, author, or tag..."
                            className="mx-auto rounded-xl border-slate-200 pl-11 focus:border-blue-300 focus:ring-blue-200"
                        />
                    </div>

                    <AsyncSelect<Tag>
                        fetcher={fetchTags}
                        preload={false}
                        renderOption={(tag) => <span>{tag.name}</span>}
                        getOptionValue={(tag) => tag.name}
                        getDisplayValue={(tag) => (
                            <div className="flex items-center gap-2">
                                <span className="truncate">{tag.name}</span>
                            </div>
                        )}
                        label="Tag"
                        placeholder="Filter by tag..."
                        value={categoryName}
                        onChange={(val) => setCategoryName(val ?? '')}
                        width={240}
                        triggerClassName="rounded-lg border-slate-200 focus:ring-blue-200"
                    />

                    <Select
                        value={sortOrder}
                        onValueChange={(val: 'latest' | 'oldest') =>
                            setSortOrder(val)
                        }
                    >
                        <SelectTrigger className="w-[160px] rounded-lg border-slate-200 focus:ring-blue-200">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="latest">Latest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                        </SelectContent>
                    </Select>

                    <Link href="/blog/new">
                        <Button className="cursor-pointer rounded-xl bg-zinc-800 font-medium text-white shadow-lg shadow-blue-600/25 hover:bg-zinc-900">
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Blog
                        </Button>
                    </Link>
                </div>

                <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBlogs.map((post) => (
                        <BlogCard key={post.id} {...post} />
                    ))}
                </div>
            </div>
        </div>
    );
}
