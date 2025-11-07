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
import { Hash } from 'lucide-react';

interface JoinRoomDialogProps {
    joinCodeDialogOpen: boolean;
    setJoinCodeDialogOpen: (show: boolean) => void;
    roomCode: string;
    setRoomCode: (code: string) => void;
}

export function JoinRoomDialog({
    joinCodeDialogOpen,
    setJoinCodeDialogOpen,
    roomCode,
    setRoomCode,
}: JoinRoomDialogProps) {
    const handleJoinByCode = () => {
        console.log('Joining room with code:', roomCode);
        window.location.href = '/room/1';
        setJoinCodeDialogOpen(false);
        setRoomCode('');
    };

    return (
        <Dialog open={joinCodeDialogOpen} onOpenChange={setJoinCodeDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="h-9 w-9 rounded-xl border border-white/20 bg-zinc-900/60 text-white shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-800/80"
                >
                    <Hash className="h-4 w-4" />
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
                        <Input
                            id="roomCode"
                            placeholder="Enter room code (e.g., DW2024)"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            className="rounded-xl border-zinc-700/50 bg-zinc-800/50 font-mono text-lg tracking-wider text-white placeholder:text-white/50"
                        />
                    </div>
                    <Button
                        onClick={handleJoinByCode}
                        disabled={!roomCode.trim()}
                        className="w-full rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
                        size="lg"
                    >
                        Join Room
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
