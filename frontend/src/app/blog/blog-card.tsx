import { useMemo } from 'react';
import {
    MessageCircle,
    Users,
    User as UserIcon,
    Calendar,
    Heart,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '@/lib/service/blog';
import { formatDate } from '@/lib/utils';
import { useReadBlog } from '@/lib/service/blog';

interface BlogCardProps {
    blogPost: BlogPost;
}

export function BlogCard({ blogPost }: BlogCardProps) {
    const dateText = useMemo(
        () => formatDate(blogPost.publishedDate),
        [blogPost.publishedDate],
    );
    const reactsCount = useMemo(
        () => blogPost.reacts?.length ?? 0,
        [blogPost.reacts],
    );
    const imgSrc = blogPost.titleImg ?? '/placeholder.svg';
    const { mutate: readMutate } = useReadBlog();

    const handleBlogClick = () => {
        readMutate(blogPost.id);
    };

    return (
        <Link
            href={`/blog/${blogPost.id}`}
            aria-label={`Read more: ${blogPost.title}`}
            onClick={() => handleBlogClick()}
        >
            <Card className="group border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-48">
                    <Image
                        src={imgSrc}
                        alt={blogPost.title}
                        fill
                        quality={85}
                        sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                        className="object-cover"
                        priority={false}
                    />
                </div>

                <CardContent className="p-6">
                    <div className="text-muted-foreground mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <div className="flex min-w-0 items-center gap-2">
                            {blogPost.author?.avatar ? (
                                <Image
                                    src={blogPost.author.avatar}
                                    alt={
                                        blogPost.author?.name ?? 'Author avatar'
                                    }
                                    width={18}
                                    height={18}
                                    className="h-4 w-4 rounded-full object-cover"
                                />
                            ) : (
                                <UserIcon className="h-4 w-4 shrink-0" />
                            )}
                            <span className="truncate">
                                {blogPost.author?.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{dateText}</span>
                        </div>
                    </div>

                    <h3 className="text-card-foreground group-hover:text-primary mb-2 text-xl leading-tight font-bold text-balance transition-colors">
                        {blogPost.title}
                    </h3>

                    <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed text-pretty">
                        {blogPost.title}
                    </p>

                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        {blogPost.tags?.map((tag) => (
                            <span
                                key={tag.id}
                                className="bg-secondary text-secondary-foreground inline-block rounded-md px-2 py-1 text-xs font-medium"
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>

                    <div className="border-border flex items-center justify-between border-t pt-4">
                        <div className="text-muted-foreground flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>
                                    {Number(
                                        blogPost.numberOfReaders ?? 0,
                                    ).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                <span>
                                    {Number(
                                        blogPost.numberOfComments ?? 0,
                                    ).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                <span>{reactsCount}</span>
                            </div>
                        </div>

                        <Button variant="outline" className="rounded-lg">
                            Read more
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
