import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface ShowShortcutDialogProps {
    showShortcutsDialog: boolean;
    setShowShortcutsDialog: (show: boolean) => void;
}
export function ShowShortcutDialog({
    showShortcutsDialog,
    setShowShortcutsDialog,
}: ShowShortcutDialogProps) {
    return (
        <Dialog
            open={showShortcutsDialog}
            onOpenChange={setShowShortcutsDialog}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        Keyboard Shortcuts
                    </DialogTitle>
                    <DialogDescription>
                        Use these shortcuts to navigate faster
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <span className="text-sm">Play/Pause Audio</span>
                        <kbd className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold">
                            Space
                        </kbd>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <span className="text-sm">Previous Sentence</span>
                        <kbd className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold">
                            ←
                        </kbd>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <span className="text-sm">Next Sentence</span>
                        <kbd className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold">
                            →
                        </kbd>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <span className="text-sm">Restart Audio</span>
                        <kbd className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold">
                            R
                        </kbd>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <span className="text-sm">Show All Words</span>
                        <kbd className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold">
                            Ctrl + A
                        </kbd>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
