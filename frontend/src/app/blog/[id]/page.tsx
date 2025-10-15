'use client';

import { useEffect, useMemo, useState } from 'react';
import { blogPostDetail, comments } from '../../../../constants/sample-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Share2, Calendar, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import CommentSection from '@/components/comment-section';
import { Content } from '@tiptap/react';

function initials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0]?.toUpperCase())
        .slice(0, 2)
        .join('');
}

export default function BlogPostPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const detail = blogPostDetail;
    const [isLoading, setIsLoading] = useState(true);
    const [value, setValue] = useState<Content | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [comment, setComment] = useState(comments);
    const handleSubmit = () => {
        setSubmitting(true);
        setValue(null);
    };
    const initialLikes = useMemo(
        () => blogPostDetail.blogPost.reacts?.length ?? 0,
        [],
    );

    const [isLiked, setIsLiked] = useState(false);

    const [likes, setLikes] = useState(initialLikes);

    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(t);
    }, []);

    const handleLike = () => {
        setIsLiked((prev) => !prev);
        setLikes((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));
        toast.success(
            isLiked ? 'Removed from favorites' : 'Added to favorites',
        );
    };

    if (isLoading) {
        return (
            <div className="bg-background min-h-screen">
                <header className="bg-background/80 border-border sticky top-0 z-50 border-b backdrop-blur-md">
                    <div className="container mx-auto px-4 py-4">
                        <Skeleton className="h-10 w-32" />
                    </div>
                </header>

                <article className="container mx-auto max-w-4xl px-4 py-8">
                    <div className="mb-8">
                        <Skeleton className="mb-4 h-6 w-20" />
                        <Skeleton className="mb-6 h-12 w-full" />
                        <div className="mb-6 flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                        </div>
                    </div>
                    <Skeleton className="mb-8 h-64 w-full rounded-lg" />
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </article>
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-foreground mb-2 text-2xl font-bold">
                        Post not found
                    </h1>
                    <p className="text-muted-foreground mb-4">
                        The blog post you are looking for does not exist.
                    </p>
                    <Button onClick={() => router.push('/blog')}>
                        Back to Blog
                    </Button>
                </div>
            </div>
        );
    }

    const { blogPost, content } = detail;
    const dateText = formatDate(blogPost.publishedDate);

    return (
        <div className="bg-background mt-8 min-h-screen">
            <article className="container mx-auto max-w-4xl px-4 py-24">
                <div className="mb-4 flex flex-wrap gap-2">
                    {blogPost.tags.map((t) => (
                        <Badge key={t.id} variant="secondary">
                            {t.name}
                        </Badge>
                    ))}
                </div>
                <h1 className="text-foreground mb-6 text-4xl leading-tight font-bold text-balance md:text-5xl">
                    {blogPost.title}
                </h1>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-start">
                        <Avatar className="h-12 w-12">
                            {blogPost.author.avatar ? (
                                <AvatarImage
                                    src={blogPost.author.avatar}
                                    alt={blogPost.author.name}
                                />
                            ) : (
                                <UserIcon className="m-auto h-5 w-5 opacity-70" />
                            )}
                            <AvatarFallback>
                                {initials(blogPost.author.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="mt-2 ml-4 flex flex-wrap items-center gap-4">
                            <p className="text-foreground font-semibold">
                                {blogPost.author.name}
                            </p>
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4" />
                                <span>{dateText}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLike}
                            className={`flex items-center gap-1 ${
                                isLiked
                                    ? 'text-red-500 hover:text-red-600'
                                    : 'text-muted-foreground hover:text-red-500'
                            }`}
                        >
                            <Heart
                                className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                            />
                            <span>{likes}</span>
                        </Button>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Share2 className="h-4 w-4" />
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Share Link</DialogTitle>
                                    <DialogDescription>
                                        Anyone who has this link will be able to
                                        view this blog!
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex items-center gap-2">
                                    <div className="grid flex-1 gap-2">
                                        <Label
                                            htmlFor="link"
                                            className="sr-only"
                                        >
                                            Link
                                        </Label>
                                        <Input
                                            id="link"
                                            defaultValue={`https://band-up-psi.vercel.app/blog/${id}`}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="sm:justify-start">
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                        >
                                            Close
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                {blogPost.titleImg && (
                    <div className="mb-8 overflow-hidden rounded-lg">
                        <Image
                            src={blogPost.titleImg}
                            alt={blogPost.title}
                            width={1200}
                            height={630}
                            className="h-64 w-full object-cover md:h-96"
                        />
                    </div>
                )}
                <div
                    className="text-foreground max-w-none leading-relaxed [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_ol]:ml-6 [&_ol]:list-decimal [&_p]:mb-4 [&_ul]:ml-6 [&_ul]:list-disc"
                    dangerouslySetInnerHTML={{
                        __html: content || '',
                    }}
                />{' '}
            </article>
            <div className="mx-auto max-w-4xl">
                <CommentSection
                    comments={comment}
                    value={value}
                    onChange={setValue}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    postButtonText="Post comment"
                />
            </div>
        </div>
    );
}
