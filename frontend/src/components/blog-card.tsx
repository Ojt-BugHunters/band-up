'use client';

import { useMemo } from 'react';
import { MessageCircle, Users, User, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag } from '@/lib/api/dto/category';
import Link from 'next/link';
import Image from 'next/image';

export interface BlogPost {
    id: string;
    title: string;
    summary: string;
    image: string;
    author: string;
    publishDate: string;
    numberOfReader: number;
    comments: number;
    category: Tag[];
}

function formatDate(input: string) {
    const d = new Date(input);
    return isNaN(d.getTime())
        ? input
        : d.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          });
}

export function BlogCard({
    id,
    title,
    summary,
    image,
    author,
    publishDate,
    numberOfReader,
    comments,
    category,
}: BlogPost) {
    const dateText = useMemo(() => formatDate(publishDate), [publishDate]);

    return (
        <Link href={`/blog/${id}`} aria-label={`Read more: ${title}`}>
            <Card className="group border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-48">
                    <Image
                        src={image || '/placeholder.svg'}
                        alt={title}
                        fill
                        quality={85}
                        sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                        className="object-cover"
                        priority={false}
                    />
                </div>

                <CardContent className="p-6">
                    <div className="text-muted-foreground mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span className="truncate">{author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{dateText}</span>
                        </div>
                    </div>

                    <h3 className="text-card-foreground group-hover:text-primary mb-2 text-xl leading-tight font-bold text-balance transition-colors">
                        {title}
                    </h3>

                    <p className="text-muted-foreground mb-4 leading-relaxed text-pretty">
                        {summary}
                    </p>

                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        {category.map((c) => (
                            <span
                                key={c.id}
                                className="bg-secondary text-secondary-foreground inline-block rounded-md px-2 py-1 text-xs font-medium"
                            >
                                {c.name}
                            </span>
                        ))}
                    </div>

                    <div className="border-border flex items-center justify-between border-t pt-4">
                        <div className="text-muted-foreground flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{numberOfReader.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                <span>{comments}</span>
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
