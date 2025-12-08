'use client';

import {
    Hero,
    HeroDescription,
    HeroKeyword,
    HeroSummary,
    HeroTitle,
} from '@/components/hero';
import {
    Stats,
    StatsDescription,
    StatsGrid,
    StatsIcon,
    StatsLabel,
    StatsValue,
} from '@/components/stats';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ClipboardCheck,
    CheckCircle2,
    XCircle,
    Target,
    Clock,
    Volume2,
    Book,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import AudioPlayer from '@/components/audio-player';
import ReadingPassage from '@/components/reading-passage';
import { useParams } from 'next/navigation';
import { useGetAttemptDetail } from '@/lib/service/attempt';
import LiquidLoading from '@/components/ui/liquid-loader';
import { NotFound } from '@/components/not-found';

function parseMetadata(metadata: string) {
    try {
        return JSON.parse(metadata);
    } catch {
        return { htmlContent: metadata };
    }
}

export default function AttemptDetailPage() {
    const { id } = useParams();
    const {
        data: attemptDetail,
        isLoading,
        isError,
    } = useGetAttemptDetail(id as string);
    const [isTestStarted, setIsTestStarted] = useState(true);

    const allAnswers = attemptDetail?.attemptSections.flatMap((section) =>
        section.sections.flatMap((s) => s.answers),
    );
    const totalQuestions = allAnswers?.length;
    const correctAnswers = allAnswers?.filter((a) => a.correct).length;
    const incorrectAnswers = allAnswers?.filter(
        (a) => !a.correct && a.answerContent !== null,
    ).length;
    const skippedQuestions = allAnswers?.filter(
        (a) => a.answerContent === null,
    ).length;
    const accuracy =
        (totalQuestions ?? 0) > 0
            ? (((correctAnswers ?? 0) / (totalQuestions ?? 1)) * 100).toFixed(1)
            : '0';

    if (isLoading) {
        return (
            <div className="bg-background flex min-h-screen w-full items-center justify-center rounded-lg border p-4">
                <LiquidLoading />
            </div>
        );
    }

    if (isError || !attemptDetail) {
        return <NotFound />;
    }

    return (
        <div className="min-h-screen space-y-8 p-6">
            <Hero>
                <HeroSummary color="blue">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Test Results
                </HeroSummary>
                <HeroTitle>
                    Your
                    <HeroKeyword color="blue">Performance</HeroKeyword>
                </HeroTitle>
                <HeroDescription>{attemptDetail.testTitle}</HeroDescription>
            </Hero>

            <StatsGrid>
                <Stats className="group relative overflow-hidden transition-all hover:scale-105">
                    <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-green-500/30 to-emerald-500/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative">
                        <StatsIcon className="bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                            <CheckCircle2 />
                        </StatsIcon>
                        <StatsValue>{correctAnswers}</StatsValue>
                        <StatsLabel>Correct</StatsLabel>
                        <StatsDescription>Accurate answers</StatsDescription>
                    </div>
                </Stats>

                <Stats className="group relative overflow-hidden transition-all hover:scale-105">
                    <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-rose-500/30 to-red-500/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative">
                        <StatsIcon className="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                            <XCircle />
                        </StatsIcon>
                        <StatsValue>{incorrectAnswers}</StatsValue>
                        <StatsLabel>Incorrect</StatsLabel>
                        <StatsDescription>Wrong answers</StatsDescription>
                    </div>
                </Stats>

                <Stats className="group relative overflow-hidden transition-all hover:scale-105">
                    <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-500/30 to-orange-500/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative">
                        <StatsIcon className="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                            <Clock />
                        </StatsIcon>
                        <StatsValue>{skippedQuestions}</StatsValue>
                        <StatsLabel>Skipped</StatsLabel>
                        <StatsDescription>Not answered</StatsDescription>
                    </div>
                </Stats>

                <Stats className="group relative overflow-hidden transition-all hover:scale-105">
                    <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500/30 to-indigo-500/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative">
                        <StatsIcon className="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                            <Target />
                        </StatsIcon>
                        <StatsValue>{accuracy}%</StatsValue>
                        <StatsLabel>Accuracy</StatsLabel>
                        <StatsDescription>Overall score</StatsDescription>
                    </div>
                </Stats>
            </StatsGrid>

            <div className="mx-auto max-w-7xl space-y-8">
                <h2 className="text-2xl font-bold text-balance">Test Review</h2>

                {attemptDetail.attemptSections.map((attemptSection, idx) =>
                    attemptSection.sections.map((section, sectionIdx) => {
                        const metadata = parseMetadata(section.metadata);
                        const isListening =
                            metadata.hasAudio && section.cloudfrontUrl;
                        const isReading =
                            attemptDetail.testSkillName === 'Reading';

                        return (
                            <Card
                                key={`${idx}-${sectionIdx}`}
                                className="group relative overflow-hidden border transition-all duration-300 hover:shadow-xl"
                            >
                                <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

                                <div className="relative">
                                    <CardHeader className="space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {isListening && (
                                                        <Badge className="border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                                                            <Volume2 className="mr-1 h-3 w-3" />
                                                            Listening
                                                        </Badge>
                                                    )}
                                                    {isReading && (
                                                        <Badge className="border-green-200 bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400">
                                                            <Book className="mr-1 h-3 w-3" />
                                                            Reading
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                    {
                                                        section.answers.filter(
                                                            (a) => a.correct,
                                                        ).length
                                                    }
                                                    /{section.answers.length}
                                                </div>
                                                <div className="text-muted-foreground text-xs">
                                                    Correct
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                                            <div>
                                                <div className="bg-card rounded-lg border">
                                                    {isListening ? (
                                                        <AudioPlayer
                                                            sections={[
                                                                {
                                                                    id: section.sectionId,
                                                                    title: section.title,
                                                                    audioUrl:
                                                                        section.cloudfrontUrl ||
                                                                        '',
                                                                    duration:
                                                                        section.timeLimitSeconds,
                                                                    metadata:
                                                                        section.metadata,
                                                                },
                                                            ]}
                                                            currentSection={
                                                                section.sectionId
                                                            }
                                                            onSectionChange={() => {}}
                                                            isTestStarted={
                                                                isTestStarted
                                                            }
                                                            onTestStart={() =>
                                                                setIsTestStarted(
                                                                    true,
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <div className="h-[700px]">
                                                            <ReadingPassage
                                                                title={
                                                                    section.title
                                                                }
                                                                metadata={
                                                                    section.metadata
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="lg:pl-4">
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-semibold text-balance">
                                                        Your Answers
                                                    </h3>
                                                    <ScrollArea className="h-[700px] pr-2">
                                                        <div className="space-y-3">
                                                            {section.answers.map(
                                                                (answer) => (
                                                                    <div
                                                                        key={
                                                                            answer.answerId
                                                                        }
                                                                        className={cn(
                                                                            'group/answer relative overflow-hidden rounded-lg border-2 p-3 text-sm transition-all duration-200 hover:shadow-md',
                                                                            answer.correct
                                                                                ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20'
                                                                                : answer.answerContent ===
                                                                                    null
                                                                                  ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20'
                                                                                  : 'border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20',
                                                                        )}
                                                                    >
                                                                        <div className="mb-2 flex items-center justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="bg-background flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold shadow-sm">
                                                                                    {
                                                                                        answer.questionNumber
                                                                                    }
                                                                                </span>
                                                                                {answer.correct ? (
                                                                                    <Badge className="bg-green-600 text-xs text-white hover:bg-green-700">
                                                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                                                        Correct
                                                                                    </Badge>
                                                                                ) : answer.answerContent ===
                                                                                  null ? (
                                                                                    <Badge className="bg-amber-600 text-xs text-white hover:bg-amber-700">
                                                                                        <Clock className="mr-1 h-3 w-3" />
                                                                                        Skipped
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Badge className="bg-rose-600 text-xs text-white hover:bg-rose-700">
                                                                                        <XCircle className="mr-1 h-3 w-3" />
                                                                                        Incorrect
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid gap-2">
                                                                            <div className="bg-background/80 rounded-md p-2">
                                                                                <div className="text-muted-foreground mb-0.5 text-[11px] font-medium tracking-wide uppercase">
                                                                                    Your
                                                                                    Answer
                                                                                </div>
                                                                                <div
                                                                                    className={cn(
                                                                                        'text-sm font-medium text-pretty',
                                                                                        answer.answerContent ===
                                                                                            null
                                                                                            ? 'text-muted-foreground italic'
                                                                                            : answer.correct
                                                                                              ? 'text-green-700 dark:text-green-400'
                                                                                              : 'text-rose-700 dark:text-rose-400',
                                                                                    )}
                                                                                >
                                                                                    {answer.answerContent ||
                                                                                        'No answer provided'}
                                                                                </div>
                                                                            </div>

                                                                            <div className="bg-background/80 rounded-md p-2">
                                                                                <div className="text-muted-foreground mb-0.5 text-[11px] font-medium tracking-wide uppercase">
                                                                                    Correct
                                                                                    Answer
                                                                                </div>
                                                                                <div className="text-sm font-medium text-pretty text-green-700 dark:text-green-400">
                                                                                    {
                                                                                        answer.correctAnswer
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </ScrollArea>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        );
                    }),
                )}
            </div>
        </div>
    );
}
