'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Search, Users } from 'lucide-react';
import { useGetRoomByCode } from '@/lib/service/room';
import { useJoinRoom } from '@/lib/service/room';
import { motion } from 'framer-motion';

interface JoinRoomByCodeDialogProps {
    joinCodeDialogOpen: boolean;
    setJoinCodeDialogOpen: (show: boolean) => void;
}

export function JoinRoomByCodeDialog({
    joinCodeDialogOpen,
    setJoinCodeDialogOpen,
}: JoinRoomByCodeDialogProps) {
    const [roomCode, setRoomCode] = useState('');
    const [submittedCode, setSubmittedCode] = useState<string | null>(null);

    const {
        data: room,
        isFetching,
        error,
    } = useGetRoomByCode(submittedCode ?? undefined);
    const { mutate: joinRoom, isPending: joining } = useJoinRoom();

    const handleSearch = () => {
        if (roomCode.trim()) {
            setSubmittedCode(roomCode.trim());
        }
    };

    const handleJoin = () => {
        if (room?.id) joinRoom(room.id);
    };

    return (
        <Dialog open={joinCodeDialogOpen} onOpenChange={setJoinCodeDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="h-9 w-9 rounded-xl border border-white/20 bg-zinc-900/60 text-white shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-800/80"
                >
                    <KeyRound className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="rounded-3xl border-zinc-700/50 bg-zinc-900/95 text-white backdrop-blur-xl sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Join Room by Code
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label
                            htmlFor="roomCode"
                            className="text-base font-semibold"
                        >
                            Room Code
                        </Label>
                        <div className="relative">
                            <Input
                                id="roomCode"
                                placeholder="Enter room code (e.g., DW2024)"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                                className="rounded-xl border-zinc-700/50 bg-zinc-800/50 pr-10 font-mono text-lg tracking-wider text-white placeholder:text-white/50"
                            />
                            <Button
                                size="icon"
                                onClick={handleSearch}
                                disabled={!roomCode.trim()}
                                className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 rounded-lg bg-cyan-500 hover:bg-cyan-600"
                            >
                                <Search className="h-4 w-4 text-white" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isFetching && (
                            <p className="text-center text-white/70">
                                Searching...
                            </p>
                        )}

                        {!isFetching && submittedCode && !room && !error && (
                            <p className="text-center text-white/60 italic">
                                No room found for code “{submittedCode}”.
                            </p>
                        )}

                        {error && (
                            <p className="text-center text-red-400">
                                Failed to fetch room info.
                            </p>
                        )}

                        {room && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl border border-zinc-700/50 bg-zinc-800/60 p-4 shadow-lg backdrop-blur-md"
                            >
                                <h3 className="mb-1 text-lg font-bold text-white">
                                    {room.roomName}
                                </h3>
                                <p className="mb-2 text-sm text-white/70">
                                    {room.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="inline-block rounded-full border border-zinc-700/50 bg-zinc-900/70 px-3 py-1 font-mono text-xs text-white">
                                        {room.roomCode}
                                    </span>
                                    <div className="flex items-center gap-1 text-sm text-white/70">
                                        <Users className="h-4 w-4" />
                                        {room.numberOfMembers ?? 0}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleJoin}
                                    disabled={joining}
                                    className="mt-4 w-full rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {joining ? 'Joining...' : 'Join Room'}
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
