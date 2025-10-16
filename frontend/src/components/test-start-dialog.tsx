'use client';

import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ClipboardList } from 'lucide-react';
import Link from 'next/link';

interface TestStartDialogProps {
    onStart: () => void;
    questionCount: number;
}

export function TestStartDialog({
    onStart,
    questionCount,
}: TestStartDialogProps) {
    const { id } = useParams<{ id: string }>();
    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-4">
                    <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                        <ClipboardList className="text-primary h-8 w-8" />
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold">
                        Start the Quiz
                    </DialogTitle>

                    <DialogDescription className="text-center text-base">
                        This test has{' '}
                        <span className="text-foreground font-semibold">
                            {questionCount} questions
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-muted/50 rounded-lg border p-4">
                        <ul className="text-muted-foreground space-y-2 text-sm">
                            <li>• Choose an answer for each question</li>
                            <li>• Immediate feedback is not available</li>
                            <li>• Submit when you finish all questions</li>
                            <li>• Review your results after submission</li>
                        </ul>
                    </div>

                    <Button onClick={onStart} className="w-full" size="lg">
                        Start Quiz
                    </Button>
                    <Link href={`/flashcard/${id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="lg">
                            Back
                        </Button>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    );
}
