'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useJoinPrivateDeck } from '@/lib/service/flashcard';
import { useLearnDeck } from '@/lib/service/flashcard';
import { useUser } from '@/lib/service/account';
import { Deck } from '@/lib/service/flashcard';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Globe, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';

export default function FlashcardCard({ card }: { card: Deck }) {
    const user = useUser();
    const [showDialog, setShowDialog] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { form, mutation } = useJoinPrivateDeck(card.id);
    const { mutate: learnMutate } = useLearnDeck(card.id);
    const [loginPromptOpen, setLoginPromptOpen] = useState(false);

    const createdAt = card.createdAt ? new Date(card.createdAt) : null;
    const createdLabel =
        createdAt && !Number.isNaN(createdAt.getTime())
            ? createdAt.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
              })
            : 'Unknown date';
    const isPublic = card.public;

    const handleCardClick = (e: React.MouseEvent) => {
        if (!isPublic) {
            e.preventDefault();
            setShowDialog(true);
        } else {
            mutation.mutate('');
        }
    };

    const handleLearnCard = () => {
        if (!user) return;
        learnMutate();
    };

    const onSubmit = ({ password }: { password: string }) => {
        mutation.mutate(password);
        setShowDialog(false);
        setShowPassword(false);
        form.reset();
    };

    const handleDialogClose = () => {
        setShowDialog(false);
        form.reset();
        setShowPassword(false);
    };

    const handleRequireLogin = (e: React.MouseEvent) => {
        e.preventDefault();
        setLoginPromptOpen(true);
    };

    const CardBody = (
        <Card
            className={cn(
                'h-full transform cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl',
                isPublic
                    ? 'border border-green-200 bg-gradient-to-br from-green-50 via-white to-emerald-50 hover:shadow-green-200/50 dark:border-green-400/30 dark:bg-gradient-to-br dark:from-emerald-900/40 dark:via-slate-800/50 dark:to-green-900/30 dark:hover:shadow-green-500/20'
                    : 'border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-pink-50 hover:shadow-rose-200/50 dark:border-rose-400/30 dark:bg-gradient-to-br dark:from-rose-900/40 dark:via-slate-800/50 dark:to-pink-900/30 dark:hover:shadow-rose-500/20',
            )}
        >
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-300">
                        {createdLabel}
                    </span>
                    <div className="flex items-center gap-1">
                        {isPublic ? (
                            <Globe className="h-4 w-4 text-green-600 dark:text-green-300" />
                        ) : (
                            <Lock className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                        )}
                        {!isPublic && (
                            <Badge
                                variant="secondary"
                                className="bg-rose-100 text-xs text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-200"
                            >
                                Private
                            </Badge>
                        )}
                    </div>
                </div>
                <CardTitle className="text-base leading-snug font-semibold text-slate-900 dark:text-slate-50">
                    {card.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {card.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <User className="h-4 w-4" />
                    {card.authorName}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    {card.learnerNumber} learners
                </p>
            </CardContent>
        </Card>
    );

    return (
        <>
            {user ? (
                <Link
                    href={`/flashcard/${card.id}`}
                    passHref
                    onClick={(e) => {
                        handleCardClick(e);
                        handleLearnCard();
                    }}
                >
                    {CardBody}
                </Link>
            ) : (
                <div
                    role="button"
                    onClick={handleRequireLogin}
                    aria-label="Open login prompt"
                >
                    {CardBody}
                </div>
            )}

            <Dialog open={showDialog} onOpenChange={handleDialogClose}>
                <DialogContent className="border-slate-200 bg-white sm:max-w-md dark:border-slate-700 dark:bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
                            <Lock className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                            Private Flashcard Deck
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 dark:text-slate-400">
                            This deck is password protected. Please enter the
                            password to access.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-900 dark:text-slate-50">
                                            Password
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={
                                                        showPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    placeholder="Enter password..."
                                                    className="border-slate-300 bg-slate-50 pr-10 text-slate-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword,
                                                        )
                                                    }
                                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-rose-600 dark:text-rose-400" />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleDialogClose}
                                    className="mr-2 border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
                                >
                                    Access Deck
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <ConfirmDialog
                open={loginPromptOpen}
                onOpenChange={setLoginPromptOpen}
                title="Login Required"
                description="You need to login to learn this deck"
                cancelText="Cancel"
                confirmText="Login"
                confirmHref="/auth/login"
            />
        </>
    );
}
