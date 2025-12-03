'use client';

import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { MessageCircle, Reply as ReplyIcon, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AccountPicture } from '@/components/ui/account-picture';
import { MinimalTiptapEditor } from '@/components/ui/minimal-tiptap';
import { Reply, Comment } from '@/lib/service/comment';
import { Content } from '@tiptap/react';

export interface CommentSectionProps {
    comments: Comment[];
    value: Content | null;
    onChange: (content: Content) => void;
    onSubmit: () => void;
    submitting?: boolean;
    className?: string;
    editorPlaceholder?: string;
    showEditor?: boolean;
    postButtonText?: string;
}

const ReplyItem = React.memo(function ReplyItem({ reply }: { reply: Reply }) {
    return (
        <div className="flex items-start gap-3">
            <div className="h-9 w-9">
                <AccountPicture name={reply.author.name} />
            </div>
            <div className="flex-1">
                <h5 className="flex items-center gap-2 font-medium text-zinc-700 dark:text-slate-300">
                    {reply.author.name}
                    <ReplyIcon className="h-4 w-4 text-zinc-500 dark:text-slate-500" />
                </h5>
                <p className="mt-1 leading-relaxed text-zinc-900 dark:text-white">
                    {reply.content}
                </p>
            </div>
        </div>
    );
});

const CommentItem = React.memo(function CommentItem({
    comment,
}: {
    comment: Comment;
}) {
    return (
        <div
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-md transition hover:shadow-lg dark:border-slate-800 dark:bg-black dark:hover:border-slate-700"
            role="article"
            aria-label={`Comment by ${comment.author.name}`}
        >
            <div className="flex items-start gap-3">
                <div className="h-10 w-10">
                    <AccountPicture name={comment.author.name} />
                </div>

                <div className="flex-1">
                    <h4 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                        {comment.author.name}
                        <MessageCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                    </h4>
                    <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">
                        {comment.content}
                    </p>

                    {comment.reply && comment.reply.length > 0 && (
                        <div className="mt-4 space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/80 p-3 dark:border-slate-800 dark:bg-slate-950">
                            {comment.reply.map((rep) => (
                                <ReplyItem key={rep.id} reply={rep} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export function CommentSection({
    comments,
    value,
    onChange,
    onSubmit,
    submitting,
    className,
    editorPlaceholder = 'What do you feel about the test...',
    showEditor = true,
    postButtonText = 'Post comment',
}: CommentSectionProps) {
    return (
        <TooltipProvider>
            <section className={cn('w-full', className)}>
                <Separator className="my-8 dark:bg-slate-800" />

                <header className="mb-8">
                    <h2 className="text-foreground mb-6 flex items-center space-x-2 text-xl font-semibold dark:text-white">
                        <MessageCircle className="h-6 w-6" />
                        <span>Comments ({comments.length})</span>
                    </h2>
                </header>

                {showEditor && (
                    <div className="mb-8 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-3">
                                <MinimalTiptapEditor
                                    value={value}
                                    onChange={onChange}
                                    className="h-full min-h-40 w-full"
                                    output="html"
                                    placeholder={editorPlaceholder}
                                    autofocus={false}
                                    editable
                                    editorContentClassName="p-5 min-h-40 cursor-text"
                                    editorClassName="focus:outline-hidden min-h-40"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={onSubmit}
                                        disabled={submitting}
                                        className="rounded-lg bg-zinc-800 hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-slate-100"
                                        aria-label={postButtonText}
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        {submitting
                                            ? 'Posting…'
                                            : postButtonText}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <Separator className="my-8 dark:bg-slate-800" />

                <div className="mb-8 space-y-6">
                    {comments.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No comments yet.
                        </p>
                    ) : (
                        comments.map((c) => (
                            <CommentItem key={c.id} comment={c} />
                        ))
                    )}
                </div>
            </section>
        </TooltipProvider>
    );
}

export default CommentSection;
