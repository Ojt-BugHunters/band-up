'use client';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface createRoomDialogProps {
    createDialogOpen: boolean;
    setCreateDialogOpen: (show: boolean) => void;
}

export function CreateRoomDialog({
    createDialogOpen,
    setCreateDialogOpen,
}: createRoomDialogProps) {
    const [newRoom, setNewRoom] = useState({
        roomName: '',
        description: '',
        isPrivate: false,
    });

    const handleCreateRoom = () => {
        console.log('Creating room:', newRoom);
        setCreateDialogOpen(false);
        setNewRoom({ roomName: '', description: '', isPrivate: false });
    };
    return (
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="h-9 w-9 rounded-xl border border-white/20 bg-gradient-to-r from-rose-400/90 to-pink-400/90 text-white shadow-lg shadow-rose-500/30 backdrop-blur-md transition-all hover:scale-105 hover:from-rose-500 hover:to-pink-500"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-zinc-700/50 bg-zinc-900/95 text-white backdrop-blur-xl sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Create New Room
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label
                            htmlFor="roomName"
                            className="text-base font-semibold"
                        >
                            Room Name
                        </Label>
                        <Input
                            id="roomName"
                            placeholder="Enter room name"
                            value={newRoom.roomName}
                            onChange={(e) =>
                                setNewRoom({
                                    ...newRoom,
                                    roomName: e.target.value,
                                })
                            }
                            className="rounded-xl border-zinc-700/50 bg-zinc-800/50 text-white placeholder:text-white/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label
                            htmlFor="description"
                            className="text-base font-semibold"
                        >
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="What's this room about?"
                            value={newRoom.description}
                            onChange={(e) =>
                                setNewRoom({
                                    ...newRoom,
                                    description: e.target.value,
                                })
                            }
                            className="min-h-[100px] rounded-xl border-zinc-700/50 bg-zinc-800/50 text-white placeholder:text-white/50"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label
                                htmlFor="private"
                                className="text-base font-semibold"
                            >
                                Private Room
                            </Label>
                            <p className="text-sm text-white/70">
                                Only invited members can join
                            </p>
                        </div>
                        <Switch
                            id="private"
                            checked={newRoom.isPrivate}
                            onCheckedChange={(checked) =>
                                setNewRoom({
                                    ...newRoom,
                                    isPrivate: checked,
                                })
                            }
                        />
                    </div>
                    <Button
                        onClick={handleCreateRoom}
                        className="w-full rounded-xl bg-rose-400 text-white hover:bg-rose-500"
                        size="lg"
                    >
                        Create Room
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
