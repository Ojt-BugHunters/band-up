import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, CheckCircle, AlertCircle } from 'lucide-react';

interface Question {
    id: number;
    type: string;
    question: string;
}

interface ProgressDialogProps {
    totalQuestions: number;
    answeredQuestions: number;
    unansweredQuestions: Question[];
}

export default function ProgressDialog({
    totalQuestions,
    answeredQuestions,
    unansweredQuestions,
}: ProgressDialogProps) {
    const progressPercentage = (answeredQuestions / totalQuestions) * 100;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                >
                    <Eye className="h-4 w-4" />
                    Progress
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="text-success h-5 w-5" />
                        Test Progress
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Overall Progress */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Overall Progress
                            </span>
                            <span className="font-medium">
                                {answeredQuestions}/{totalQuestions}
                            </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                        <div className="text-muted-foreground flex justify-between text-xs">
                            <span>
                                {Math.round(progressPercentage)}% Complete
                            </span>
                            <span>
                                {totalQuestions - answeredQuestions} remaining
                            </span>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-success/10 border-success/20 rounded-lg border p-3 text-center">
                            <div className="text-success text-2xl font-bold">
                                {answeredQuestions}
                            </div>
                            <div className="text-success text-xs">Answered</div>
                        </div>
                        <div className="bg-warning/10 border-warning/20 rounded-lg border p-3 text-center">
                            <div className="text-warning text-2xl font-bold">
                                {unansweredQuestions.length}
                            </div>
                            <div className="text-warning text-xs">
                                Unanswered
                            </div>
                        </div>
                    </div>

                    {/* Unanswered Questions */}
                    {unansweredQuestions.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="text-warning h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Unanswered Questions
                                </span>
                            </div>

                            <ScrollArea className="border-border h-32 rounded-md border p-2">
                                <div className="space-y-2">
                                    {unansweredQuestions.map((question) => (
                                        <div
                                            key={question.id}
                                            className="bg-muted/50 flex items-center justify-between rounded p-2"
                                        >
                                            <span className="text-sm">
                                                Question {question.id}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {question.type.replace(
                                                    '-',
                                                    ' ',
                                                )}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {/* Completion Status */}
                    <div className="bg-primary/10 border-primary/20 rounded-lg border p-3">
                        <div className="text-center text-sm">
                            {progressPercentage === 100 ? (
                                <span className="text-success font-medium">
                                    ✓ All questions completed!
                                </span>
                            ) : (
                                <span className="text-primary">
                                    Keep going!{' '}
                                    {totalQuestions - answeredQuestions}{' '}
                                    questions left.
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
