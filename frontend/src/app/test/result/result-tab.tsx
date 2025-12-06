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
import { CheckCircle2, XCircle, Share2, RotateCcw } from 'lucide-react';

interface Response {
    id: string;
    attemptSectionId: string;
    questionId: string;
    answerContent: string;
    correctAnswer: string;
    createAt: string;
    correct: boolean;
}

interface ResultsTabProps {
    testData: { responses: Response[] };
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

    const getBandScore = (percentage: number) => {
        if (percentage >= 90) return 9;
        if (percentage >= 80) return 8;
        if (percentage >= 70) return 7;
        if (percentage >= 60) return 6;
        if (percentage >= 50) return 5;
        if (percentage >= 40) return 4;
        return 3;
    };

    const bandScore = getBandScore(percentage);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Band Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <p className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
                                    {bandScore}.0
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    Out of 9.0
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Correct Answers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <p className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-4xl font-bold text-transparent">
                                    {correctAnswers}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    of {totalQuestions} questions
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Success Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <p className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-4xl font-bold text-transparent">
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

            {/* Performance Progress Bar */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg">Your Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="bg-muted flex h-3 overflow-hidden rounded-full">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
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
                                className="border-border bg-background text-foreground placeholder-muted-foreground w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                                        {/* Icon and Question Number */}
                                        <div className="flex-shrink-0 pt-1">
                                            {response.correct ? (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                </div>
                                            ) : (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Question Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="bg-muted/50"
                                                >
                                                    Q{index + 1}
                                                </Badge>
                                                <span
                                                    className={`text-xs font-semibold ${response.correct ? 'text-green-600' : 'text-red-600'}`}
                                                >
                                                    {response.correct
                                                        ? 'Correct'
                                                        : 'Incorrect'}
                                                </span>
                                            </div>

                                            {/* Answer Comparison */}
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-2">
                                                    <p className="text-muted-foreground mb-1 text-xs font-semibold">
                                                        Your Answer
                                                    </p>
                                                    <p className="text-foreground font-mono font-bold">
                                                        {response.answerContent}
                                                    </p>
                                                </div>
                                                <div
                                                    className={`rounded-lg border p-2 ${
                                                        response.correct
                                                            ? 'border-green-500/30 bg-green-500/10'
                                                            : 'border-amber-500/30 bg-amber-500/10'
                                                    }`}
                                                >
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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <Button
                    variant="outline"
                    className="border-border/50 hover:bg-muted/50 flex-1 gap-2 border-2 bg-transparent"
                >
                    <Share2 className="h-4 w-4" />
                    Share Results
                </Button>
                <Button className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:from-blue-600 hover:to-purple-600">
                    <RotateCcw className="h-4 w-4" />
                    Retake Test
                </Button>
            </div>
        </div>
    );
}
