import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

interface CongratsDialogProps {
    showCompleteDialog: boolean;
    setShowCompleteDialog: (show: boolean) => void;
}
export function CongratsDialog({
    showCompleteDialog,
    setShowCompleteDialog,
}: CongratsDialogProps) {
    const router = useRouter();
    return (
        <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
            <DialogContent className="max-w-sm rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-slate-800">
                        🎉 Great job!
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-slate-600">
                        You&apos;ve completed all sentences in this dictation.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 rounded-lg bg-indigo-50/70 px-4 py-3 text-sm text-indigo-800">
                    Your progress has been recorded. You can review this
                    dictation or go back to choose another test.
                </div>

                <DialogFooter className="mt-6 flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowCompleteDialog(false)}
                    >
                        Stay here
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={() => {
                            setShowCompleteDialog(false);
                            router.push('/dictation');
                        }}
                    >
                        Back to dictation list
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
