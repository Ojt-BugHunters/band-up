import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Target, Zap } from 'lucide-react';

interface ModeSelectionDialogProps {
    showModeDialog: boolean;
    setShowModeDialog: (show: boolean) => void;
    handleModeSelect: (selectMode: 'beginner' | 'master') => void;
}

export function ModeSelectionDialog({
    showModeDialog,
    setShowModeDialog,
    handleModeSelect,
}: ModeSelectionDialogProps) {
    return (
        <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold">
                        Choose Your Practice Mode
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Select the difficulty level that matches your learning
                        goals
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Card
                        className="group cursor-pointer border-2 p-6 transition-all hover:border-teal-400 hover:shadow-lg hover:shadow-teal-400/20"
                        onClick={() => handleModeSelect('beginner')}
                    >
                        <div className="flex items-start gap-4">
                            <div className="rounded-lg bg-gradient-to-br from-teal-300 to-emerald-400 p-3 shadow-lg">
                                <Target className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-2 text-lg font-bold">
                                    Beginner Mode
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    See hints with hidden words. Perfect for
                                    building confidence and learning new
                                    vocabulary.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="bg-teal-50 text-teal-700"
                                    >
                                        Word Hints
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className="bg-teal-50 text-teal-700"
                                    >
                                        Reveal Options
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card
                        className="group cursor-pointer border-2 p-6 transition-all hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/20"
                        onClick={() => handleModeSelect('master')}
                    >
                        <div className="flex items-start gap-4">
                            <div className="rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 p-3 shadow-lg">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-2 text-lg font-bold">
                                    Master Mode
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    No hints provided. Challenge yourself with
                                    authentic IELTS listening practice.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="bg-blue-50 text-blue-700"
                                    >
                                        No Hints
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className="bg-blue-50 text-blue-700"
                                    >
                                        Full Challenge
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
