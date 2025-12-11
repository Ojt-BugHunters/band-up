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
import {
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Award,
    MessageSquare,
    Clock,
    FileText,
} from 'lucide-react';

interface IeltsData {
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

interface CategoryFeedback {
    band: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
}

interface Props {
    data: IeltsData;
}

export function SpeakingIeltsResponse({ data }: Props) {
    const getBandColor = (band: number) => {
        if (band >= 8) return 'text-emerald-700';
        if (band >= 7) return 'text-blue-700';
        if (band >= 6) return 'text-amber-700';
        return 'text-orange-700';
    };

    const getBandBgColor = (band: number) => {
        if (band >= 8) return 'bg-emerald-50 border-emerald-300';
        if (band >= 7) return 'bg-blue-50 border-blue-300';
        if (band >= 6) return 'bg-amber-50 border-amber-300';
        return 'bg-orange-50 border-orange-300';
    };

    const getProgressColor = (band: number) => {
        if (band >= 8) return '[&>div]:bg-emerald-500';
        if (band >= 7) return '[&>div]:bg-blue-500';
        if (band >= 6) return '[&>div]:bg-amber-500';
        return '[&>div]:bg-orange-500';
    };

    const getIconBgColor = (band: number) => {
        if (band >= 8) return 'bg-emerald-100';
        if (band >= 7) return 'bg-blue-100';
        if (band >= 6) return 'bg-amber-100';
        return 'bg-orange-100';
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
        <div className="space-y-5">
            {/* Overall Score Card */}
            <Card className="border-2 border-purple-300 bg-purple-50 shadow-md">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold text-purple-900">
                                Overall Band Score
                            </CardTitle>
                            <CardDescription className="mt-0.5 text-sm text-purple-700">
                                Your IELTS Speaking Performance
                            </CardDescription>
                        </div>
                        <div className="rounded-xl bg-purple-100 p-2">
                            <Award className="h-5 w-5 text-purple-700" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pb-3">
                    <div className="flex items-center gap-4">
                        <div
                            className={`text-4xl font-black ${getBandColor(data.overall_band)}`}
                        >
                            {data.overall_band.toFixed(1)}
                        </div>
                        <div className="grid flex-1 grid-cols-2 gap-2">
                            <div className="space-y-0.5 rounded-lg border border-slate-300 bg-white p-2.5">
                                <p className="flex items-center gap-1 text-xs font-medium text-slate-600">
                                    <Clock className="h-3 w-3" />
                                    Duration
                                </p>
                                <p className="text-base font-bold text-slate-900">
                                    {data.duration}s
                                </p>
                            </div>
                            <div className="space-y-0.5 rounded-lg border border-slate-300 bg-white p-2.5">
                                <p className="flex items-center gap-1 text-xs font-medium text-slate-600">
                                    <FileText className="h-3 w-3" />
                                    Words
                                </p>
                                <p className="text-base font-bold text-slate-900">
                                    {data.word_count}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Progress
                        value={data.overall_band * 11.11}
                        className={`mt-3 h-2 ${getProgressColor(data.overall_band)}`}
                    />
                </CardContent>
            </Card>

            {/* Band Scores Grid */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {categories.map((category) => (
                    <Card
                        key={category.key}
                        className={`border-2 shadow-sm transition-shadow hover:shadow-md ${getBandBgColor(category.band)}`}
                    >
                        <CardHeader className="px-3 pt-3 pb-2">
                            <div className="mb-1 flex items-center justify-between">
                                <div
                                    className={`rounded-lg p-1.5 ${getIconBgColor(category.band)}`}
                                >
                                    <category.icon className="h-3.5 w-3.5" />
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={`${getBandColor(category.band)} border border-current bg-white px-2 py-0 text-sm font-bold`}
                                >
                                    {category.band}
                                </Badge>
                            </div>
                            <CardTitle className="text-xs leading-tight font-semibold text-slate-900">
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

            {/* Transcript Card */}
            <Card className="border-2 border-teal-300 bg-teal-50 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base text-teal-900">
                        <div className="rounded-lg bg-teal-100 p-1.5">
                            <MessageSquare className="h-4 w-4" />
                        </div>
                        Your Response
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                    <div className="rounded-lg border border-teal-200 bg-white p-3">
                        <p className="text-sm leading-relaxed text-slate-700">
                            &ldquo;{data.transcript}&rdquo;
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Feedback */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {categories.map((category) => (
                    <Card
                        key={category.key}
                        className="overflow-hidden border-2 border-slate-300 shadow-sm"
                    >
                        <CardHeader
                            className={`${getBandBgColor(category.band)} border-b-2 border-current pt-3 pb-2.5`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div
                                    className={`rounded-lg p-1.5 ${getIconBgColor(category.band)}`}
                                >
                                    <category.icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-sm font-bold text-slate-900">
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
                        <CardContent className="space-y-3 pt-3 pb-3">
                            <div className="rounded-lg border border-slate-300 bg-slate-50 p-2.5">
                                <p className="text-xs leading-relaxed text-slate-700">
                                    {category.data.feedback}
                                </p>
                            </div>

                            <Separator className="my-1" />

                            <div className="space-y-2.5">
                                {/* Strengths section */}
                                <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-2.5">
                                    <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Strengths
                                    </h4>
                                    <ul className="space-y-1">
                                        {category.data.strengths.map(
                                            (strength, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-1.5 text-xs"
                                                >
                                                    <span className="mt-0.5 text-xs font-bold text-emerald-600">
                                                        ✓
                                                    </span>
                                                    <span className="leading-relaxed text-slate-700">
                                                        {strength}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>

                                {/* Weaknesses section */}
                                <div className="rounded-lg border border-orange-300 bg-orange-50 p-2.5">
                                    <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-orange-700">
                                        <AlertCircle className="h-3 w-3" />
                                        Areas for Improvement
                                    </h4>
                                    <ul className="space-y-1">
                                        {category.data.weaknesses.map(
                                            (weakness, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-1.5 text-xs"
                                                >
                                                    <span className="mt-0.5 text-xs font-bold text-orange-600">
                                                        !
                                                    </span>
                                                    <span className="leading-relaxed text-slate-700">
                                                        {weakness}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>

                                {/* Recommendations section */}
                                <div className="rounded-lg border border-blue-300 bg-blue-50 p-2.5">
                                    <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-blue-700">
                                        <TrendingUp className="h-3 w-3" />
                                        Recommendations
                                    </h4>
                                    <ul className="space-y-1">
                                        {category.data.improvements.map(
                                            (improvement, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-1.5 text-xs"
                                                >
                                                    <span className="mt-0.5 text-xs font-bold text-blue-600">
                                                        →
                                                    </span>
                                                    <span className="leading-relaxed text-slate-700">
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
