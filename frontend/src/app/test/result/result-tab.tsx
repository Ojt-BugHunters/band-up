'use client';

import { useState, useMemo } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import type { BandScoreResponse } from '@/lib/service/attempt/type';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useRouter } from 'next/navigation';
import { clearTestLocalStorage } from '@/lib/utils';

interface ResultsTabProps {
    testData: BandScoreResponse;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
}

export default function ResultsTab({
    testData,
    correctAnswers,
    totalQuestions,
    percentage,
}: ResultsTabProps) {
    const [selectedFilter, setSelectedFilter] = useState<
        'all' | 'correct' | 'incorrect'
    >('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [quitDialogOpen, setQuitDialogOpen] = useState(false);
    const [quitLoading, setQuitLoading] = useState(false);

    const router = useRouter();

    const filteredQuestions = useMemo(() => {
        return testData.responses.filter((response) => {
            const matchesFilter =
                selectedFilter === 'all' ||
                (selectedFilter === 'correct' && response.correct) ||
                (selectedFilter === 'incorrect' && !response.correct);

            const matchesSearch =
                searchQuery === '' ||
                response.answerContent
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());

            return matchesFilter && matchesSearch;
        });
    }, [testData.responses, selectedFilter, searchQuery]);

    const bandScore = testData.bandScore;

    const handleQuitConfirm = async () => {
        try {
            setQuitLoading(true);
            clearTestLocalStorage();
            router.push('/test');
        } finally {
            setQuitLoading(false);
            setQuitDialogOpen(false);
        }
    };

    const handleRetakeTryAgain = () => {
        clearTestLocalStorage();
        router.push('/test');
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-zinc-100 to-zinc-200/50" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Band Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <p className="text-4xl font-bold text-zinc-800">
                                    {bandScore}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    Out of 9.0
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-zinc-100 to-zinc-200/50" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Correct Answers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <p className="text-4xl font-bold text-zinc-800">
                                    {correctAnswers}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    of {totalQuestions} questions
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-zinc-100 to-zinc-200/50" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Success Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <p className="text-4xl font-bold text-zinc-800">
                                    {percentage}%
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    accuracy
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg">Your Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="bg-muted flex h-3 overflow-hidden rounded-full">
                            <div
                                className="bg-zinc-800 transition-all duration-500 ease-out"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <div className="text-muted-foreground flex justify-between text-sm">
                            <span>0%</span>
                            <span className="text-foreground font-semibold">
                                {percentage}%
                            </span>
                            <span>100%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg">
                        Detailed Breakdown
                    </CardTitle>
                    <CardDescription>
                        Review your answers question by question
                    </CardDescription>

                    <div className="mt-4 space-y-4">
                        <div className="flex gap-2">
                            <Button
                                variant={
                                    selectedFilter === 'all'
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => setSelectedFilter('all')}
                                className="rounded-full"
                            >
                                All ({totalQuestions})
                            </Button>
                            <Button
                                variant={
                                    selectedFilter === 'correct'
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => setSelectedFilter('correct')}
                                className="rounded-full"
                            >
                                Correct ({correctAnswers})
                            </Button>
                            <Button
                                variant={
                                    selectedFilter === 'incorrect'
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => setSelectedFilter('incorrect')}
                                className="rounded-full"
                            >
                                Incorrect ({totalQuestions - correctAnswers})
                            </Button>
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Search answer content..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-border bg-background text-foreground placeholder-muted-foreground w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-zinc-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="space-y-3">
                        {filteredQuestions.length === 0 ? (
                            <div className="text-muted-foreground py-8 text-center">
                                No questions match your filter
                            </div>
                        ) : (
                            filteredQuestions.map((response, index) => (
                                <div
                                    key={response.id}
                                    className="border-border/50 from-card to-card/50 hover:border-border overflow-hidden rounded-lg border bg-gradient-to-r shadow-sm transition-all duration-300 hover:shadow-md"
                                >
                                    <div className="flex items-start gap-3 px-4 py-3">
                                        <div className="flex-shrink-0 pt-1">
                                            {response.correct ? (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200">
                                                    <CheckCircle2 className="h-5 w-5 text-zinc-700" />
                                                </div>
                                            ) : (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-300">
                                                    <XCircle className="h-5 w-5 text-zinc-600" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="bg-muted/50"
                                                >
                                                    Q{index + 1}
                                                </Badge>
                                                <span
                                                    className={`text-xs font-semibold ${response.correct ? 'text-zinc-700' : 'text-zinc-600'}`}
                                                >
                                                    {response.correct
                                                        ? 'Correct'
                                                        : 'Incorrect'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="rounded-lg border border-zinc-300 bg-zinc-100/50 p-2">
                                                    <p className="text-muted-foreground mb-1 text-xs font-semibold">
                                                        Your Answer
                                                    </p>
                                                    <p className="text-foreground font-mono font-bold">
                                                        {response.answerContent}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg border border-zinc-400 bg-zinc-200/50 p-2">
                                                    <p className="text-muted-foreground mb-1 text-xs font-semibold">
                                                        Correct Answer
                                                    </p>
                                                    <p className="text-foreground font-mono font-bold">
                                                        {response.correctAnswer}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
                <Button
                    variant="outline"
                    className="border-border/50 hover:bg-muted/50 flex-1 gap-2 border-2 bg-transparent"
                    onClick={() => setQuitDialogOpen(true)}
                >
                    Quit test
                </Button>

                <Button
                    className="flex-1 gap-2 bg-zinc-800 text-white shadow-lg hover:bg-zinc-900"
                    onClick={() => handleRetakeTryAgain}
                >
                    <RotateCcw className="h-4 w-4" />
                    Try again
                </Button>
            </div>

            <ConfirmDialog
                open={quitDialogOpen}
                onOpenChange={setQuitDialogOpen}
                title="Quit the test ?"
                description="If you quit, you just can view your result in the history tab"
                confirmText="Confirm"
                cancelText="Cancel"
                destructive
                loading={quitLoading}
                onConfirm={handleQuitConfirm}
            />
        </div>
    );
}
