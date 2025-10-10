'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Zap, Target } from 'lucide-react';

interface LearnModeDialogProps {
    onModeSelect: (mode: 'fast' | 'all') => void;
}

export function LearnModeDialog({ onModeSelect }: LearnModeDialogProps) {
    const router = useRouter();

    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-center text-2xl font-bold">
                        Choose Your Learning Mode
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Select how you want to study these flashcards
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 sm:grid-cols-2">
                    <Card
                        className="hover:border-primary cursor-pointer transition-all hover:shadow-lg"
                        onClick={() => onModeSelect('fast')}
                    >
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="bg-primary/10 rounded-lg p-2">
                                    <Zap className="text-primary h-6 w-6" />
                                </div>
                                <CardTitle>Learn Fast</CardTitle>
                            </div>
                            <CardDescription>
                                Quick review for tests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-muted-foreground space-y-2 text-sm">
                                <li>• Answer each question correctly once</li>
                                <li>• Get instant feedback</li>
                                <li>• Perfect for quick reviews</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card
                        className="hover:border-primary cursor-pointer transition-all hover:shadow-lg"
                        onClick={() => onModeSelect('all')}
                    >
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="bg-primary/10 rounded-lg p-2">
                                    <Target className="text-primary h-6 w-6" />
                                </div>
                                <CardTitle>Learn All</CardTitle>
                            </div>
                            <CardDescription>
                                Master the material
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-muted-foreground space-y-2 text-sm">
                                <li>• Answer each question correctly twice</li>
                                <li>• Reinforce your knowledge</li>
                                <li>• Best for long-term retention</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter className="mt-2">
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => router.push('/flashcard')}
                    >
                        Back
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
