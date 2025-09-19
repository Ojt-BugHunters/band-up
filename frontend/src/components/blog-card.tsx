'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Clock, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface BlogCardProps {
    id: number;
    title: string;
    excerpt: string;
    image: string;
    author: string;
    publishDate: string;
    readTime: string;
    likes: number;
    comments: number;
    category: string;
}

export function BlogCard({
    id,
    title,
    excerpt,
    image,
    author,
    publishDate,
    readTime,
    likes: initialLikes,
    comments,
    category,
}: BlogCardProps) {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(false);

    const handleLike = () => {
        if (isLiked) {
            setLikes((prev) => prev - 1);
        } else {
            setLikes((prev) => prev + 1);
        }
        setIsLiked(!isLiked);
    };

    return (
        <Card className="group border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative overflow-hidden">
                <Image
                    src={image || '/placeholder.svg'}
                    alt={title}
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    width={65}
                    height={65}
                />
                <div className="absolute top-3 left-3">
                    <span className="bg-primary text-primary-foreground inline-block rounded-md px-2 py-1 text-xs font-medium">
                        {category}
                    </span>
                </div>
            </div>

            <CardContent className="p-6">
                <div className="text-muted-foreground mb-3 flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{readTime}</span>
                    </div>
                </div>

                <h3 className="text-card-foreground group-hover:text-primary mb-3 text-xl leading-tight font-bold text-balance transition-colors">
                    {title}
                </h3>

                <p className="text-muted-foreground mb-4 leading-relaxed text-pretty">
                    {excerpt}
                </p>

                <div className="border-border flex items-center justify-between border-t pt-4">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`flex items-center space-x-1 transition-colors ${
                                isLiked
                                    ? 'text-red-500 hover:text-red-600'
                                    : 'text-muted-foreground hover:text-red-500'
                            }`}
                            onClick={handleLike}
                        >
                            <Heart
                                className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                            />
                            <span className="text-sm font-medium">{likes}</span>
                        </Button>

                        <div className="text-muted-foreground flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                {comments}
                            </span>
                        </div>
                    </div>

                    <span className="text-muted-foreground text-sm">
                        {publishDate}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
