'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOutsideClick } from '@/hooks/use-outside-click';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Clock,
    Target,
    TrendingUp,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { TestHistory } from '@/lib/api/dto/test';

const skillColors = {
    Listening: 'bg-blue-500',
    Reading: 'bg-green-500',
    Writing: 'bg-purple-500',
    Speaking: 'bg-orange-500',
};

const skillBadgeColors = {
    Listening: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    Reading:
        'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    Writing:
        'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    Speaking:
        'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
};

export default function TestHistoryGrid({
    testHistory,
}: {
    testHistory: TestHistory[];
}) {
    const [active, setActive] = useState<TestHistory | null>(null);
    const ref = useRef<HTMLDivElement>(null!);
    const id = useId();

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setActive(null);
            }
        }

        if (active) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [active]);

    useOutsideClick(ref, () => setActive(null));

    return (
        <>
            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-10 h-full w-full bg-black/60 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {active ? (
                    <div className="fixed inset-0 z-[100] grid place-items-center p-4">
                        <motion.button
                            key={`button-${active.id}-${id}`}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{
                                opacity: 0,
                                transition: { duration: 0.05 },
                            }}
                            className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                            onClick={() => setActive(null)}
                        >
                            <CloseIcon />
                        </motion.button>

                        <motion.div
                            layoutId={`card-${active.id}-${id}`}
                            ref={ref}
                            className="flex h-auto max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900"
                        >
                            <div
                                className={`${skillColors[active.skill]} p-6 text-white`}
                            >
                                <motion.div
                                    layoutId={`skill-${active.id}-${id}`}
                                >
                                    <h2 className="mb-2 text-3xl font-bold">
                                        {active.skill} Test
                                    </h2>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {new Date(
                                                    active.date,
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>{active.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4" />
                                            <span>
                                                Score: {active.overallScore}/9.0
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="flex-1 overflow-auto p-6">
                                <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
                                    {/* Left Side - Charts */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="h-full"
                                    >
                                        <Card className="flex h-full flex-col border-2">
                                            <CardHeader className="pb-4">
                                                <CardTitle>
                                                    Performance Overview
                                                </CardTitle>
                                                <CardDescription>
                                                    Score breakdown by section
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="min-h-0 flex-1">
                                                {active.sectionScores.length >
                                                1 ? (
                                                    <ChartContainer
                                                        config={{
                                                            score: {
                                                                label: 'Score',
                                                                color: 'hsl(var(--chart-1))',
                                                            },
                                                        }}
                                                        className="h-full w-full"
                                                    >
                                                        <ResponsiveContainer
                                                            width="100%"
                                                            height="100%"
                                                        >
                                                            <BarChart
                                                                data={active.sectionScores.map(
                                                                    (
                                                                        section,
                                                                    ) => ({
                                                                        section:
                                                                            section.section,
                                                                        score: section.score,
                                                                        maxScore:
                                                                            section.maxScore,
                                                                        percentage:
                                                                            Math.round(
                                                                                (section.score /
                                                                                    section.maxScore) *
                                                                                    100,
                                                                            ),
                                                                    }),
                                                                )}
                                                                margin={{
                                                                    top: 10,
                                                                    right: 10,
                                                                    left: 0,
                                                                    bottom: 40,
                                                                }}
                                                            >
                                                                <CartesianGrid
                                                                    strokeDasharray="3 3"
                                                                    className="stroke-muted"
                                                                />
                                                                <XAxis
                                                                    dataKey="section"
                                                                    angle={-45}
                                                                    textAnchor="end"
                                                                    height={60}
                                                                    tick={{
                                                                        fontSize: 12,
                                                                    }}
                                                                />
                                                                <YAxis
                                                                    tick={{
                                                                        fontSize: 12,
                                                                    }}
                                                                />
                                                                <ChartTooltip
                                                                    content={
                                                                        <ChartTooltipContent />
                                                                    }
                                                                />
                                                                <Bar
                                                                    dataKey="score"
                                                                    fill="var(--color-score)"
                                                                    radius={[
                                                                        8, 8, 0,
                                                                        0,
                                                                    ]}
                                                                />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                ) : (
                                                    // Single section - show summary stats
                                                    <div className="space-y-6 py-8">
                                                        <div className="space-y-2 text-center">
                                                            <div className="text-primary text-6xl font-bold">
                                                                {
                                                                    active.overallScore
                                                                }
                                                            </div>
                                                            <div className="text-muted-foreground text-sm font-medium">
                                                                Band Score
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950">
                                                                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                                                                    {
                                                                        active.correctAnswers
                                                                    }
                                                                </div>
                                                                <div className="mt-1 text-sm font-medium text-green-600 dark:text-green-400">
                                                                    Correct
                                                                </div>
                                                            </div>
                                                            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
                                                                <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                                                                    {active.totalQuestions -
                                                                        active.correctAnswers}
                                                                </div>
                                                                <div className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                                                                    Wrong
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-muted/30 rounded-xl p-6">
                                                            <div className="mb-3 flex items-center justify-between">
                                                                <span className="text-sm font-semibold">
                                                                    Accuracy
                                                                </span>
                                                                <span className="text-primary text-2xl font-bold">
                                                                    {
                                                                        active.accuracy
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="bg-muted h-4 overflow-hidden rounded-full">
                                                                <motion.div
                                                                    initial={{
                                                                        width: 0,
                                                                    }}
                                                                    animate={{
                                                                        width: `${active.accuracy}%`,
                                                                    }}
                                                                    transition={{
                                                                        duration: 1,
                                                                        ease: 'easeOut',
                                                                    }}
                                                                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {active.sectionScores.map(
                                                                (
                                                                    section,
                                                                    idx,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="bg-muted/20 flex items-center justify-between rounded-lg p-4"
                                                                    >
                                                                        <span className="text-sm font-medium">
                                                                            {
                                                                                section.section
                                                                            }
                                                                        </span>
                                                                        <span className="text-sm font-bold">
                                                                            {
                                                                                section.score
                                                                            }
                                                                            /
                                                                            {
                                                                                section.maxScore
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* Right Side - Question Breakdown */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="h-full"
                                    >
                                        <Card className="flex h-full flex-col border-2">
                                            <CardHeader className="pb-4">
                                                <CardTitle>
                                                    Question Breakdown
                                                </CardTitle>
                                                <CardDescription>
                                                    Your answer for each
                                                    question
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="min-h-0 flex-1 overflow-auto">
                                                {active.sectionScores.length >
                                                1 ? (
                                                    <div className="space-y-6">
                                                        {active.sectionScores.map(
                                                            (
                                                                section,
                                                                sectionIndex,
                                                            ) => {
                                                                const sectionQuestions =
                                                                    active.questions?.filter(
                                                                        (q) =>
                                                                            q.section ===
                                                                            section.section,
                                                                    );
                                                                const correctCount =
                                                                    sectionQuestions?.filter(
                                                                        (q) =>
                                                                            q.isCorrect,
                                                                    ).length ||
                                                                    0;
                                                                const totalCount =
                                                                    sectionQuestions?.length ||
                                                                    0;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            sectionIndex
                                                                        }
                                                                        className="space-y-3"
                                                                    >
                                                                        <div className="bg-background sticky top-0 flex items-center justify-between border-b pb-2">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="text-foreground text-sm font-bold tracking-wide uppercase">
                                                                                    {
                                                                                        section.section
                                                                                    }
                                                                                </div>
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="font-semibold"
                                                                                >
                                                                                    {
                                                                                        correctCount
                                                                                    }

                                                                                    /
                                                                                    {
                                                                                        totalCount
                                                                                    }
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="text-muted-foreground text-sm">
                                                                                {(
                                                                                    (correctCount /
                                                                                        totalCount) *
                                                                                    100
                                                                                ).toFixed(
                                                                                    0,
                                                                                )}

                                                                                %
                                                                            </div>
                                                                        </div>
                                                                        <div className="grid grid-cols-5 gap-2">
                                                                            {sectionQuestions?.map(
                                                                                (
                                                                                    question,
                                                                                ) => (
                                                                                    <motion.div
                                                                                        key={
                                                                                            question.questionNumber
                                                                                        }
                                                                                        whileHover={{
                                                                                            scale: 1.1,
                                                                                        }}
                                                                                        whileTap={{
                                                                                            scale: 0.95,
                                                                                        }}
                                                                                        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-3 transition-all ${
                                                                                            question.isCorrect
                                                                                                ? 'border-green-400 bg-green-50 hover:border-green-500 hover:shadow-lg hover:shadow-green-200 dark:border-green-600 dark:bg-green-950 dark:hover:border-green-500'
                                                                                                : 'border-red-400 bg-red-50 hover:border-red-500 hover:shadow-lg hover:shadow-red-200 dark:border-red-600 dark:bg-red-950 dark:hover:border-red-500'
                                                                                        }`}
                                                                                    >
                                                                                        <div className="flex flex-col items-center gap-1">
                                                                                            {question.isCorrect ? (
                                                                                                <CheckCircle2 className="h-6 w-6 text-green-600 transition-transform group-hover:scale-110 dark:text-green-400" />
                                                                                            ) : (
                                                                                                <XCircle className="h-6 w-6 text-red-600 transition-transform group-hover:scale-110 dark:text-red-400" />
                                                                                            )}
                                                                                            <span
                                                                                                className={`text-sm font-bold ${
                                                                                                    question.isCorrect
                                                                                                        ? 'text-green-700 dark:text-green-300'
                                                                                                        : 'text-red-700 dark:text-red-300'
                                                                                                }`}
                                                                                            >
                                                                                                {
                                                                                                    question.questionNumber
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    </motion.div>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                ) : (
                                                    // Single section - show all questions
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-5 gap-2">
                                                            {active.questions?.map(
                                                                (question) => (
                                                                    <motion.div
                                                                        key={
                                                                            question.questionNumber
                                                                        }
                                                                        whileHover={{
                                                                            scale: 1.1,
                                                                        }}
                                                                        whileTap={{
                                                                            scale: 0.95,
                                                                        }}
                                                                        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-3 transition-all ${
                                                                            question.isCorrect
                                                                                ? 'border-green-400 bg-green-50 hover:border-green-500 hover:shadow-lg hover:shadow-green-200 dark:border-green-600 dark:bg-green-950 dark:hover:border-green-500'
                                                                                : 'border-red-400 bg-red-50 hover:border-red-500 hover:shadow-lg hover:shadow-red-200 dark:border-red-600 dark:bg-red-950 dark:hover:border-red-500'
                                                                        }`}
                                                                    >
                                                                        <div className="flex flex-col items-center gap-1">
                                                                            {question.isCorrect ? (
                                                                                <CheckCircle2 className="h-6 w-6 text-green-600 transition-transform group-hover:scale-110 dark:text-green-400" />
                                                                            ) : (
                                                                                <XCircle className="h-6 w-6 text-red-600 transition-transform group-hover:scale-110 dark:text-red-400" />
                                                                            )}
                                                                            <span
                                                                                className={`text-sm font-bold ${
                                                                                    question.isCorrect
                                                                                        ? 'text-green-700 dark:text-green-300'
                                                                                        : 'text-red-700 dark:text-red-300'
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    question.questionNumber
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </motion.div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ) : null}
            </AnimatePresence>

            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testHistory.map((test) => (
                    <motion.div
                        layoutId={`card-${test.id}-${id}`}
                        key={`card-${test.id}-${id}`}
                        onClick={() => setActive(test)}
                        className="group cursor-pointer"
                        whileHover={{ y: -8 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="border-border hover:border-primary/30 relative overflow-hidden rounded-2xl border bg-white shadow-md transition-all duration-300 hover:shadow-2xl dark:bg-neutral-900">
                            {/* Colored accent bar with glow */}
                            <div
                                className={`${skillColors[test.skill]} relative h-2`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                            </div>

                            {/* Subtle hover glow effect */}
                            <div
                                className={`pointer-events-none absolute -inset-1 opacity-0 transition-opacity duration-500 group-hover:opacity-20 ${skillColors[test.skill]} -z-10 blur-2xl`}
                            />

                            <CardHeader className="pt-6 pb-4">
                                <div className="flex items-start justify-between gap-4">
                                    <motion.div
                                        layoutId={`skill-${test.id}-${id}`}
                                        className="flex-1"
                                    >
                                        <CardTitle className="text-foreground mb-3 text-2xl font-bold">
                                            {test.skill}
                                        </CardTitle>
                                        <Badge
                                            className={`${skillBadgeColors[test.skill]} px-3 py-1 font-semibold`}
                                        >
                                            {test.skill} Test
                                        </Badge>
                                    </motion.div>
                                    <div className="bg-primary/10 border-primary/20 rounded-2xl border p-3 text-right shadow-sm">
                                        <div className="text-primary text-4xl leading-none font-bold">
                                            {test.overallScore}
                                        </div>
                                        <div className="text-muted-foreground mt-1 text-xs font-medium">
                                            / 9.0
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pb-6">
                                <div className="space-y-2">
                                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                                        <div className="bg-muted/50 flex h-8 w-8 items-center justify-center rounded-lg">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium">
                                            {new Date(
                                                test.date,
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>

                                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                                        <div className="bg-muted/50 flex h-8 w-8 items-center justify-center rounded-lg">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium">
                                            {test.duration}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 border-t pt-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground text-sm font-medium">
                                            Accuracy
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="bg-muted h-2 w-20 overflow-hidden rounded-full">
                                                <div
                                                    className={`h-full ${skillColors[test.skill]} rounded-full transition-all`}
                                                    style={{
                                                        width: `${test.accuracy}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold">
                                                {test.accuracy}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground text-sm font-medium">
                                            Correct Answers
                                        </span>
                                        <span className="text-sm font-bold">
                                            {test.correctAnswers}
                                            <span className="text-muted-foreground font-normal">
                                                /{test.totalQuestions}
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-3">
                                    <div className="text-primary bg-primary/5 group-hover:bg-primary/10 border-primary/10 flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all group-hover:gap-3">
                                        <span>View Details</span>
                                        <TrendingUp className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </>
    );
}

const CloseIcon = () => {
    return (
        <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.05 } }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-black dark:text-white"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
        </motion.svg>
    );
};
