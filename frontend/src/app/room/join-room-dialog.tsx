import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Room } from '@/lib/api/dto/room';
import { useJoinRoom } from '@/lib/service/room';

interface JoinRoomDialog {
    confirmJoinDialogOpen: boolean;
    setConfirmJoinDialogOpen: (show: boolean) => void;
    selectedRoom: Room | null;
}

export function JoinRoomDialog({
    confirmJoinDialogOpen,
    setConfirmJoinDialogOpen,
    selectedRoom,
}: JoinRoomDialog) {
    const { mutate: joinRoom } = useJoinRoom();

    const handleConfirmJoin = () => {
        joinRoom(selectedRoom?.id ?? '');
    };

    return (
        <Dialog
            open={confirmJoinDialogOpen}
            onOpenChange={setConfirmJoinDialogOpen}
        >
            <DialogContent className="border-zinc-700/50 bg-zinc-900/95 text-white backdrop-blur-xl sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Join Room
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <p className="text-base text-white/90">
                            Are you sure you want to join this room?
                        </p>
                        {selectedRoom && (
                            <div className="space-y-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4 backdrop-blur-md">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/70">
                                        Room Name:
                                    </span>
                                    <span className="font-bold text-white">
                                        {selectedRoom.roomName}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/70">
                                        Room Code:
                                    </span>
                                    <span className="rounded bg-zinc-900/50 px-2 py-1 font-mono text-sm text-white">
                                        {selectedRoom.roomCode}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/70">
                                        Members:
                                    </span>
                                    <span className="font-semibold text-white">
                                        {selectedRoom.numberOfMembers}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setConfirmJoinDialogOpen(false)}
                            variant="outline"
                            className="flex-1 border-zinc-700/50 bg-zinc-800/80 text-white backdrop-blur-md hover:bg-zinc-700/80"
                            size="lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmJoin}
                            className="flex-1 bg-rose-400 text-white hover:bg-rose-500"
                            size="lg"
                        >
                            Join Room
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
