'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Copy, Check, Home } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface RoomMenuDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roomName: string;
    description: string;
    isPrivate: boolean;
    roomId: string;
    members: { id: string; name: string }[];
    onSave?: (data: {
        name: string;
        description: string;
        isPrivate: boolean;
    }) => void;
    onLeave?: () => void;
}

export function RoomMenuDialog({
    open,
    onOpenChange,
    roomName,
    description,
    isPrivate,
    roomId,
    members,
    onSave,
    onLeave,
}: RoomMenuDialogProps) {
    const [tab, setTab] = useState('info');
    const [editingName, setEditingName] = useState(roomName);
    const [editingDesc, setEditingDesc] = useState(description);
    const [privateState, setPrivateState] = useState(isPrivate);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(
            `${window.location.origin}/room/${roomId}`,
        );
        setCopied(true);
        toast.success('Room link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        onSave?.({
            name: editingName,
            description: editingDesc,
            isPrivate: privateState,
        });
        toast.success('Room updated');
        onOpenChange(false);
    };

    const handleLeave = () => {
        toast.error('You left the room');
        onLeave?.();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay className="fixed inset-0 bg-black/10 backdrop-blur-[2px]" />
            <DialogContent
                className={cn(
                    'w-[90vw] max-w-2xl rounded-3xl border border-white/10',
                    'bg-gradient-to-b from-white/10 via-white/5 to-black/40',
                    'shadow-[0_0_25px_rgba(0,0,0,0.6),_inset_0_1px_4px_rgba(255,255,255,0.1)] backdrop-blur-2xl',
                    'overflow-hidden p-0 text-white',
                    'pointer-events-auto',
                )}
            >
                <DialogHeader className="px-8 pt-6">
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                        <Home className="h-5 w-5 text-cyan-400" />
                        {roomName}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={tab} onValueChange={setTab} className="px-8 pb-6">
                    <TabsList className="my-4 grid grid-cols-3 rounded-xl bg-white/10 p-1 backdrop-blur">
                        <TabsTrigger
                            value="info"
                            className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
                        >
                            Info
                        </TabsTrigger>
                        <TabsTrigger
                            value="share"
                            className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
                        >
                            Share
                        </TabsTrigger>
                        <TabsTrigger
                            value="members"
                            className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
                        >
                            Members
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-5 pt-2">
                        <div>
                            <label className="mb-1 block text-sm text-white/70">
                                Name
                            </label>
                            <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-white/70">
                                Description
                            </label>
                            <Textarea
                                value={editingDesc}
                                onChange={(e) => setEditingDesc(e.target.value)}
                                className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-white/80">
                                Private Room
                            </span>
                            <Switch
                                checked={privateState}
                                onCheckedChange={setPrivateState}
                                className="data-[state=checked]:bg-green-500"
                            />
                        </div>

                        <div className="flex justify-between gap-3 pt-4">
                            <Button
                                onClick={handleSave}
                                className="flex-1 bg-cyan-500 text-white hover:bg-cyan-600"
                            >
                                Save
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="flex-1 bg-red-500 text-white hover:bg-red-600">
                                        Leave Room
                                    </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent className="max-w-md rounded-2xl border border-white/10 bg-zinc-900/95 text-white shadow-xl backdrop-blur-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-lg font-bold text-red-400">
                                            Leave Room?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-sm text-white/70">
                                            If you leave this room, it will be{' '}
                                            <span className="font-semibold text-red-400">
                                                deleted permanently
                                            </span>{' '}
                                            — including all messages and data.
                                            <br />
                                            Are you sure you want to continue?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="pt-4">
                                        <AlertDialogCancel className="rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20">
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => {
                                                toast.error(
                                                    'You left the room',
                                                );
                                                handleLeave();
                                                onOpenChange(false);
                                            }}
                                            className="rounded-xl bg-red-500 text-white hover:bg-red-600"
                                        >
                                            Yes, Leave & Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>{' '}
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="share"
                        className="space-y-6 pt-3 text-center"
                    >
                        <p className="text-sm text-white/70">
                            Copy and share this link with your friends
                        </p>

                        <div
                            className={cn(
                                'mx-auto flex w-full max-w-md items-center rounded-2xl border border-white/10',
                                'bg-gradient-to-b from-white/10 via-white/5 to-black/40 backdrop-blur-xl',
                                'shadow-[0_0_20px_rgba(0,0,0,0.4),_inset_0_1px_3px_rgba(255,255,255,0.08)]',
                                'p-2 transition-all hover:shadow-[0_0_25px_rgba(0,0,0,0.5)]',
                            )}
                        >
                            <Input
                                readOnly
                                value={`${window.location.origin}/room/${roomId}`}
                                className={cn(
                                    'flex-1 border-none bg-transparent font-mono text-sm text-white',
                                    'focus-visible:ring-0 focus-visible:ring-offset-0',
                                    'placeholder:text-white/40',
                                )}
                            />
                            <Button
                                onClick={handleCopy}
                                size="icon"
                                className={cn(
                                    'ml-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600',
                                    'shadow-[0_0_10px_rgba(34,211,238,0.4)] transition-all hover:scale-105',
                                )}
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 animate-pulse" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        <p className="text-xs text-white/50">
                            Anyone with this link can join your room if it’s
                            public
                        </p>
                    </TabsContent>

                    <TabsContent value="members" className="space-y-4 pt-2">
                        <h3 className="font-semibold text-white/80">
                            Active Members
                        </h3>
                        <ul className="grid gap-2">
                            {members.map((m) => (
                                <li
                                    key={m.id}
                                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold">
                                        {m.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-white">
                                        {m.name}
                                    </span>
                                </li>
                            ))}
                            {members.length === 0 && (
                                <p className="text-center text-sm text-white/50">
                                    No members in this room yet
                                </p>
                            )}
                        </ul>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
