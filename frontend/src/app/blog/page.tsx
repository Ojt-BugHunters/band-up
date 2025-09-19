'use client';
import { BlogCard } from '@/components/blog-card';
import { FeaturedCarousel } from '@/components/feature-carousel';
import { blogPosts } from '@/constants/sample-data';

export default function BlogListPage() {
    return (
        <div className="bg-background min-h-screen">
            <section className="px-4 pt-25 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-12 text-center">
                        <h1 className="text-foreground mb-6 text-4xl font-bold text-balance md:text-6xl">
                            Discover Amazing Stories
                        </h1>
                        <p className="text-muted-foreground mx-auto max-w-2xl text-xl leading-relaxed text-pretty">
                            Explore our curated collection of articles,
                            tutorials, and insights from industry experts and
                            passionate writers.
                        </p>
                    </div>
                    <FeaturedCarousel />
                </div>
            </section>

            <section className="bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-12 flex items-center justify-between">
                        <h2 className="text-foreground text-3xl font-bold">
                            Latest Articles
                        </h2>
                        <div className="flex items-center space-x-4">
                            <select className="border-border bg-background text-foreground focus:ring-primary rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2">
                                <option>All Categories</option>
                                <option>Tutorial</option>
                                <option>Design</option>
                                <option>Performance</option>
                                <option>CSS</option>
                                <option>TypeScript</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {blogPosts.map((post) => (
                            <BlogCard key={post.id} {...post} />
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-8 py-3 font-medium transition-colors">
                            Load More Articles
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
