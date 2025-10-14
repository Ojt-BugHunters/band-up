'use client';
import { ConfirmDialog } from '@/components/confirm-dialog';
import FlashcardPlayer from '@/components/flashcard-player';
import { AccountPicture } from '@/components/ui/account-picture';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteDeck } from '@/hooks/use-delete-deck';
import { useUser } from '@/hooks/use-user';
import { DeckCard } from '@/lib/api/dto/flashcard';
import {
    BookOpenCheck,
    ClipboardCheck,
    Edit,
    GraduationCap,
    Settings,
    Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function FlashcardDetailPage() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const raw = localStorage.getItem(`deck:${id}`);
    const deckCard: DeckCard = raw ? JSON.parse(raw) : null;
    const totalCards = deckCard?.cards.length;
    const deleteMutation = useDeleteDeck();
    const user = useUser();
    const isOwner = user?.id === deckCard?.authorId ? true : false;
    const handleDelete = () => {
        setOpen(true);
    };

    return (
        <div className="mt-20 min-h-screen bg-gray-50 dark:bg-[#0a092d]">
            <div className="bg-white dark:bg-[#0a092d]">
                <div className="mx-auto max-w-7xl px-6 py-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
                                {deckCard?.title}
                            </h1>
                            <div className="mb-4 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8">
                                        <AccountPicture
                                            name={deckCard?.authorName}
                                        />
                                    </div>
                                    <span className="font-medium dark:text-gray-300">
                                        {deckCard?.authorName}
                                    </span>
                                </div>
                                <span>•</span>
                                <span>
                                    {new Date(
                                        deckCard?.createdAt,
                                    ).toLocaleDateString()}
                                </span>
                                <span>•</span>
                                <Badge
                                    variant="secondary"
                                    className={
                                        deckCard?.public
                                            ? 'border-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'border-0 bg-gray-200 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300'
                                    }
                                >
                                    {deckCard?.public ? 'Public' : 'Private'}
                                </Badge>
                            </div>
                        </div>
                        {isOwner && (
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="transition-colors dark:border-gray-700 dark:bg-[#2e3856] dark:text-white dark:hover:bg-[#3d4a6b]"
                                        >
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-48 dark:border-gray-700 dark:bg-[#2e3856]"
                                    >
                                        <DropdownMenuItem
                                            onClick={() =>
                                                router.push(
                                                    `/flashcard/${id}/edit`,
                                                )
                                            }
                                            className="cursor-pointer transition-colors dark:text-white dark:hover:bg-[#3d4a6b] dark:focus:bg-[#3d4a6b]"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={handleDelete}
                                            className="cursor-pointer text-red-600 transition-colors dark:text-red-400 dark:hover:bg-[#3d4a6b] dark:focus:bg-[#3d4a6b] dark:focus:text-red-400"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                        <ConfirmDialog
                            open={open}
                            onOpenChange={setOpen}
                            title="Do you want to delete this deck ?"
                            description="This action cannot be undone"
                            confirmText={
                                deleteMutation.isPending
                                    ? 'Delete...'
                                    : 'Delete'
                            }
                            cancelText="Cancel"
                            destructive
                            loading={deleteMutation.isPending}
                            onConfirm={() => deleteMutation.mutate(id)}
                        />
                    </div>

                    <div className="mt-6 flex gap-4">
                        <Link
                            href={`/flashcard/${id}/memorize`}
                            className="flex-1"
                        >
                            <Button
                                variant="outline"
                                className="border-lg h-auto w-full justify-start py-4 dark:border-gray-700 dark:bg-[#2e3856] dark:hover:bg-[#3d4a6b]"
                            >
                                <div className="flex items-center gap-3">
                                    <BookOpenCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <div className="text-left">
                                        <div className="text-lg font-semibold dark:text-white">
                                            Flashcards
                                        </div>
                                        <div className="text-base text-gray-500 dark:text-gray-400">
                                            Review terms and definitions
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        </Link>
                        <Link
                            href={`/flashcard/${id}/learn`}
                            className="flex-1"
                        >
                            <Button
                                variant="outline"
                                className="h-auto w-full justify-start py-4 dark:border-gray-700 dark:bg-[#2e3856] dark:hover:bg-[#3d4a6b]"
                            >
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    <div className="text-left">
                                        <div className="text-lg font-semibold dark:text-white">
                                            Learn
                                        </div>
                                        <div className="text-base text-gray-500 dark:text-gray-400">
                                            Study with adaptive learning
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        </Link>
                        <Link href="/flashcard/${id}/learn" className="flex-1">
                            <Button
                                variant="outline"
                                className="h-auto w-full justify-start py-4 dark:border-gray-700 dark:bg-[#2e3856] dark:hover:bg-[#3d4a6b]"
                            >
                                <div className="flex items-center gap-3">
                                    <ClipboardCheck className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                                    <div className="text-left">
                                        <div className="text-lg font-semibold dark:text-white">
                                            Test
                                        </div>
                                        <div className="text-base text-gray-500 dark:text-gray-400">
                                            Take a practice test
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        </Link>
                    </div>
                    <FlashcardPlayer deckCards={deckCard} />
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Terms in this set ({totalCards})
                    </h2>
                </div>

                <div className="space-y-3">
                    {deckCard?.cards.map((card, index) => (
                        <Card
                            key={card.id}
                            className="border border-gray-200 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-[#2e3856] dark:hover:shadow-xl dark:hover:shadow-black/20"
                        >
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="border-r border-gray-200 pr-8 dark:border-gray-700">
                                        <div className="mb-2 text-xs font-semibold text-gray-500 uppercase dark:text-gray-500">
                                            Term
                                        </div>
                                        <p className="text-base font-medium text-gray-900 dark:text-white">
                                            {card.front}
                                        </p>
                                    </div>
                                    <div className="pl-8">
                                        <div className="mb-2 text-xs font-semibold text-gray-500 uppercase dark:text-gray-500">
                                            Definition
                                        </div>
                                        <p className="text-base text-gray-700 dark:text-gray-300">
                                            {card.back}
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 text-sm font-semibold text-gray-400 dark:text-gray-600">
                                    {index + 1}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
