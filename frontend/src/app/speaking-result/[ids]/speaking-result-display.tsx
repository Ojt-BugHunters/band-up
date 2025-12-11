'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Award,
    MessageSquare,
    Clock,
    FileText,
} from 'lucide-react';

export interface CategoryFeedback {
    band: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
}

export interface SpeakingEvaluationResponse {
    session_id: string;
    transcript: string;
    duration: number;
    word_count: number;
    overall_band: number;
    fluency_band: number;
    lexical_band: number;
    grammar_band: number;
    pronunciation_band: number;
    feedback: {
        overall: string;
        fluency: CategoryFeedback;
        lexical: CategoryFeedback;
        grammar: CategoryFeedback;
        pronunciation: CategoryFeedback;
    };
    confidence_score: number;
    model_used: string;
    evaluated_at: number;
    token_usage: {
        total_tokens: number;
    };
}

interface DisplayProps {
    results?: SpeakingEvaluationResponse[];
}

export default function SpeakingResultDisplay({ results }: DisplayProps) {
    if (!results || results.length === 0) return null;

    if (results.length === 1) {
        return <SpeakingIeltsResponse data={results[0]} />;
    }

    return (
        <div className="w-full">
            <Tabs defaultValue="part-0" className="w-full">
                <div className="mb-6 flex justify-center">
                    <TabsList className="bg-zinc-100">
                        {results.map((_, index) => (
                            <TabsTrigger
                                key={`trigger-${index}`}
                                value={`part-${index}`}
                                className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
                            >
                                Part {index + 1}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {results.map((result, index) => (
                    <TabsContent
                        key={`content-${index}`}
                        value={`part-${index}`}
                    >
                        <SpeakingIeltsResponse data={result} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

interface ResponseProps {
    data: SpeakingEvaluationResponse;
}

export function SpeakingIeltsResponse({ data }: ResponseProps) {
    const getBandColor = (band: number) => {
        if (band >= 8) return 'text-zinc-800';
        if (band >= 7) return 'text-zinc-700';
        if (band >= 6) return 'text-zinc-600';
        return 'text-zinc-500';
    };

    const getBandBgColor = (band: number) => {
        if (band >= 8) return 'bg-zinc-100 border-zinc-300';
        if (band >= 7) return 'bg-zinc-50 border-zinc-200';
        if (band >= 6) return 'bg-zinc-50 border-zinc-200';
        return 'bg-zinc-50 border-zinc-200';
    };

    const getProgressColor = (band: number) => {
        if (band >= 8) return '[&>div]:bg-zinc-800';
        if (band >= 7) return '[&>div]:bg-zinc-700';
        if (band >= 6) return '[&>div]:bg-zinc-600';
        return '[&>div]:bg-zinc-500';
    };

    const getIconBgColor = (band: number) => {
        if (band >= 8) return 'bg-zinc-200 text-zinc-800';
        if (band >= 7) return 'bg-zinc-100 text-zinc-700';
        if (band >= 6) return 'bg-zinc-100 text-zinc-600';
        return 'bg-zinc-100 text-zinc-500';
    };

    const categories = [
        {
            key: 'fluency',
            label: 'Fluency & Coherence',
            icon: MessageSquare,
            data: data.feedback.fluency,
            band: data.fluency_band,
        },
        {
            key: 'lexical',
            label: 'Lexical Resource',
            icon: FileText,
            data: data.feedback.lexical,
            band: data.lexical_band,
        },
        {
            key: 'grammar',
            label: 'Grammatical Range',
            icon: Award,
            data: data.feedback.grammar,
            band: data.grammar_band,
        },
        {
            key: 'pronunciation',
            label: 'Pronunciation',
            icon: TrendingUp,
            data: data.feedback.pronunciation,
            band: data.pronunciation_band,
        },
    ];

    return (
        <div className="animate-in fade-in space-y-5 duration-500">
            <Card className="relative overflow-hidden border-0 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-100/50 via-zinc-50/30 to-zinc-100/50" />
                <CardHeader className="relative pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold text-zinc-900">
                                Overall Band Score
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm text-zinc-600">
                                Your IELTS Speaking Performance
                            </CardDescription>
                        </div>
                        <div className="rounded-xl bg-zinc-800 p-2.5">
                            <Award className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="relative pb-4">
                    <div className="flex items-center gap-4">
                        <div className="text-5xl font-black text-zinc-800">
                            {data.overall_band.toFixed(1)}
                        </div>
                        <div className="grid flex-1 grid-cols-2 gap-2">
                            <div className="space-y-1 rounded-lg border border-zinc-200 bg-white/80 p-2.5 backdrop-blur">
                                <p className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
                                    <Clock className="h-3.5 w-3.5" />
                                    Duration
                                </p>
                                <p className="text-base font-bold text-zinc-900">
                                    {data.duration}s
                                </p>
                            </div>
                            <div className="space-y-1 rounded-lg border border-zinc-200 bg-white/80 p-2.5 backdrop-blur">
                                <p className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
                                    <FileText className="h-3.5 w-3.5" />
                                    Words
                                </p>
                                <p className="text-base font-bold text-zinc-900">
                                    {data.word_count}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Progress
                        value={data.overall_band * 11.11}
                        className={`mt-4 h-2.5 ${getProgressColor(data.overall_band)}`}
                    />
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {categories.map((category) => (
                    <Card
                        key={category.key}
                        className={`border transition-all duration-200 hover:scale-105 hover:shadow-md ${getBandBgColor(category.band)}`}
                    >
                        <CardHeader className="px-3 pt-3 pb-2">
                            <div className="mb-1.5 flex items-center justify-between">
                                <div
                                    className={`rounded-lg p-1.5 ${getIconBgColor(category.band)}`}
                                >
                                    <category.icon className="h-4 w-4" />
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={`${getBandColor(category.band)} border border-current bg-white px-2 py-0.5 text-sm font-bold`}
                                >
                                    {category.band}
                                </Badge>
                            </div>
                            <CardTitle className="text-xs leading-tight font-semibold text-zinc-900">
                                {category.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                            <Progress
                                value={category.band * 11.11}
                                className={`h-1.5 ${getProgressColor(category.band)}`}
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100/30 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
                        <div className="rounded-lg bg-zinc-200 p-1.5 text-zinc-700">
                            <MessageSquare className="h-4 w-4" />
                        </div>
                        Your Response
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                    <div className="rounded-lg border border-zinc-200 bg-white p-3.5">
                        <p className="text-sm leading-relaxed text-zinc-700">
                            &ldquo;{data.transcript}&rdquo;
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {categories.map((category) => (
                    <Card
                        key={category.key}
                        className="overflow-hidden border-zinc-200 shadow-sm"
                    >
                        <CardHeader
                            className={`border-b pt-3 pb-3 ${getBandBgColor(category.band)}`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div
                                    className={`rounded-lg p-1.5 ${getIconBgColor(category.band)}`}
                                >
                                    <category.icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-sm font-bold text-zinc-900">
                                        {category.label}
                                    </CardTitle>
                                    <CardDescription className="mt-0.5 text-xs">
                                        Band Score:{' '}
                                        <span
                                            className={`font-bold ${getBandColor(category.band)}`}
                                        >
                                            {category.band}
                                        </span>
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4 pb-4">
                            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                                <p className="text-xs leading-relaxed text-zinc-700">
                                    {category.data.feedback}
                                </p>
                            </div>

                            <Separator className="my-2" />

                            <div className="space-y-2.5">
                                <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3">
                                    <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Strengths
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {category.data.strengths.map(
                                            (strength, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-2 text-xs"
                                                >
                                                    <span className="mt-0.5 text-xs font-bold text-zinc-600">
                                                        ✓
                                                    </span>
                                                    <span className="leading-relaxed text-zinc-700">
                                                        {strength}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>

                                <div className="rounded-lg border border-zinc-300 bg-zinc-100/50 p-3">
                                    <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        Areas for Improvement
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {category.data.weaknesses.map(
                                            (weakness, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-2 text-xs"
                                                >
                                                    <span className="mt-0.5 text-xs font-bold text-zinc-600">
                                                        !
                                                    </span>
                                                    <span className="leading-relaxed text-zinc-700">
                                                        {weakness}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>

                                <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3">
                                    <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        Recommendations
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {category.data.improvements.map(
                                            (improvement, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-2 text-xs"
                                                >
                                                    <span className="mt-0.5 text-xs font-bold text-zinc-600">
                                                        →
                                                    </span>
                                                    <span className="leading-relaxed text-zinc-700">
                                                        {improvement}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
