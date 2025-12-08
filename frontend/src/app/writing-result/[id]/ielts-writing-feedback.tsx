'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    CheckCircle2,
    XCircle,
    Lightbulb,
    MessageSquare,
    FileText,
} from 'lucide-react';

interface FeedbackData {
    feedback: {
        overall: string;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
        task_achievement: CriterionDetail;
        coherence: CriterionDetail;
        lexical: CriterionDetail;
        grammar: CriterionDetail;
        quoted_examples?: QuotedExample[];
    };
    overall_band: number;
    task_achievement_band: number;
    coherence_band: number;
    lexical_band: number;
    grammar_band: number;
    word_count: number;
    evaluated_at: number;
}

interface CriterionDetail {
    band: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
}

interface QuotedExample {
    quote: string;
    issue: string;
    suggestion: string;
}

export function IELTSFeedbackDisplay({ data }: { data: FeedbackData[] }) {
    if (data.length === 0) {
        return (
            <Card className="border-2">
                <CardContent className="text-muted-foreground py-12 text-center">
                    No feedback data available
                </CardContent>
            </Card>
        );
    }

    if (data.length === 1) {
        return <FeedbackCard feedback={data[0]} />;
    }

    return (
        <Tabs defaultValue="task-1" className="w-full">
            <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="task-1">Task 1</TabsTrigger>
                <TabsTrigger value="task-2">Task 2</TabsTrigger>
            </TabsList>
            <TabsContent value="task-1">
                <FeedbackCard feedback={data[0]} />
            </TabsContent>
            <TabsContent value="task-2">
                <FeedbackCard feedback={data[1]} />
            </TabsContent>
        </Tabs>
    );
}

function FeedbackCard({ feedback }: { feedback: FeedbackData }) {
    const getBandColor = (band: number) => {
        if (band >= 7) return 'text-emerald-600 dark:text-emerald-400';
        if (band >= 6) return 'text-blue-600 dark:text-blue-400';
        if (band >= 5) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getBandBgColor = (band: number) => {
        if (band >= 7)
            return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800';
        if (band >= 6)
            return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
        if (band >= 5)
            return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
    };

    return (
        <div className="space-y-6">
            {/* Overall Score Card */}
            <Card
                className={`border-2 ${getBandBgColor(feedback.overall_band)} shadow-lg transition-shadow duration-300 hover:shadow-xl`}
            >
                <CardHeader className="pb-4 text-center">
                    <CardTitle className="mb-2 text-2xl">
                        Overall Band Score
                    </CardTitle>
                    <div
                        className={`text-6xl font-bold ${getBandColor(feedback.overall_band)}`}
                    >
                        {feedback.overall_band}
                    </div>
                    <CardDescription className="mt-2 text-base">
                        Word Count: {feedback.word_count} words
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Band Scores Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <BandScoreCard
                    title="Task Achievement"
                    band={feedback.task_achievement_band}
                    getBandColor={getBandColor}
                />
                <BandScoreCard
                    title="Coherence & Cohesion"
                    band={feedback.coherence_band}
                    getBandColor={getBandColor}
                />
                <BandScoreCard
                    title="Lexical Resource"
                    band={feedback.lexical_band}
                    getBandColor={getBandColor}
                />
                <BandScoreCard
                    title="Grammar Range"
                    band={feedback.grammar_band}
                    getBandColor={getBandColor}
                />
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border-2 border-emerald-200 shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-emerald-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-5 w-5" />
                            Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {feedback.feedback.strengths.map(
                                (strength, idx) => (
                                    <li
                                        key={idx}
                                        className="flex gap-2 text-sm"
                                    >
                                        <span className="mt-1 text-emerald-500">
                                            •
                                        </span>
                                        <span>{strength}</span>
                                    </li>
                                ),
                            )}
                        </ul>
                    </CardContent>
                </Card>

                <Card className="border-2 border-red-200 shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-red-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                            <XCircle className="h-5 w-5" />
                            Weaknesses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {feedback.feedback.weaknesses.map(
                                (weakness, idx) => (
                                    <li
                                        key={idx}
                                        className="flex gap-2 text-sm"
                                    >
                                        <span className="mt-1 text-red-500">
                                            •
                                        </span>
                                        <span>{weakness}</span>
                                    </li>
                                ),
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Criteria */}
            <Card className="border-2 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Detailed Criteria Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <CriterionSection
                        title="Task Achievement"
                        criterion={feedback.feedback.task_achievement}
                        getBandColor={getBandColor}
                    />
                    <Separator />
                    <CriterionSection
                        title="Coherence & Cohesion"
                        criterion={feedback.feedback.coherence}
                        getBandColor={getBandColor}
                    />
                    <Separator />
                    <CriterionSection
                        title="Lexical Resource"
                        criterion={feedback.feedback.lexical}
                        getBandColor={getBandColor}
                    />
                    <Separator />
                    <CriterionSection
                        title="Grammar Range & Accuracy"
                        criterion={feedback.feedback.grammar}
                        getBandColor={getBandColor}
                    />
                </CardContent>
            </Card>

            {/* Quoted Examples */}
            {feedback.feedback.quoted_examples &&
                feedback.feedback.quoted_examples.length > 0 && (
                    <Card className="border-2 border-purple-200 shadow-md dark:border-purple-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                                <MessageSquare className="h-5 w-5" />
                                Specific Examples
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {feedback.feedback.quoted_examples.map(
                                (example, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-muted/50 space-y-2 rounded-lg border p-4"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-sm font-semibold">
                                                Your text:
                                            </p>
                                            <p className="border-muted-foreground border-l-4 pl-3 text-sm italic">
                                                &quot;{example.quote}&quot;
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                                Issue:
                                            </p>
                                            <p className="text-sm">
                                                {example.issue}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                Suggestion:
                                            </p>
                                            <p className="text-sm">
                                                {example.suggestion}
                                            </p>
                                        </div>
                                    </div>
                                ),
                            )}
                        </CardContent>
                    </Card>
                )}

            {/* Recommendations */}
            <Card className="border-2 border-blue-200 shadow-md dark:border-blue-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                        <Lightbulb className="h-5 w-5" />
                        Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {feedback.feedback.recommendations.map(
                            (recommendation, idx) => (
                                <li key={idx} className="flex gap-2 text-sm">
                                    <span className="mt-1 text-blue-500">
                                        •
                                    </span>
                                    <span>{recommendation}</span>
                                </li>
                            ),
                        )}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}

function BandScoreCard({
    title,
    band,
    getBandColor,
}: {
    title: string;
    band: number;
    getBandColor: (band: number) => string;
}) {
    return (
        <Card className="border-2 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <CardHeader className="pb-3">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`text-4xl font-bold ${getBandColor(band)}`}>
                    {band}
                </div>
            </CardContent>
        </Card>
    );
}

function CriterionSection({
    title,
    criterion,
    getBandColor,
}: {
    title: string;
    criterion: CriterionDetail;
    getBandColor: (band: number) => string;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{title}</h3>
                <Badge
                    variant="outline"
                    className={`px-3 py-1 text-lg ${getBandColor(criterion.band)}`}
                >
                    Band {criterion.band}
                </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
                {criterion.feedback}
            </p>

            {criterion.improvements && criterion.improvements.length > 0 && (
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
                    <p className="mb-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
                        💡 How to improve:
                    </p>
                    <ul className="space-y-1">
                        {criterion.improvements.map((improvement, idx) => (
                            <li key={idx} className="flex gap-2 text-sm">
                                <span className="text-blue-500">→</span>
                                <span>{improvement}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
