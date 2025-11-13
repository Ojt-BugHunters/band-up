'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { NotFound } from '@/components/not-found';
import { SectionsPanel } from '../section-panel';
import { cn } from '@/lib/utils';
import { ChevronLeft, ListChecks } from 'lucide-react';
import { useGetSectionQuestions } from '@/lib/service/dictation';

export default function DictationTestMenuPage() {
    const { testId } = useParams<{ testId: string }>();
    const router = useRouter();

    const { data, isLoading, isError } = useGetSectionQuestions(testId);
    const sections = data ?? [];

    const [activeQuestionId, setActiveQuestionId] = useState<
        string | undefined
    >(undefined);

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <NotFound />;

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-indigo-50/40 to-blue-50/20">
            <header className="border-b bg-white/90 px-6 py-4 shadow-sm backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dictation">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-slate-100"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">
                                Dictation Test
                            </h1>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Choose a section and question to start
                                practicing.
                            </p>
                        </div>
                    </div>

                    <Badge
                        variant="outline"
                        className="border-indigo-200 bg-indigo-50 text-[11px] text-indigo-700"
                    >
                        Test ID:{' '}
                        <span className="ml-1 font-mono">{testId}</span>
                    </Badge>
                </div>
            </header>

            <main className="flex flex-1 items-start justify-center px-4 py-6">
                <div className="flex w-full max-w-6xl gap-6">
                    <Card className="flex flex-1 flex-col border-0 bg-white/90 shadow-xl">
                        <div className="flex items-center justify-between border-b bg-gradient-to-r from-indigo-100/80 to-blue-100/60 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <ListChecks className="h-5 w-5 text-indigo-600" />
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-800">
                                        Sections & Questions
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Browse sections and pick a question to
                                        start.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-1 p-4">
                            <SectionsPanel
                                testId={testId}
                                sections={sections}
                                activeQuestionId={activeQuestionId}
                                onSelectQuestion={(qid) => {
                                    setActiveQuestionId(qid);
                                    const found = sections
                                        .flatMap((s) => s.questions ?? [])
                                        .find((q) => q.id === qid);
                                    if (!found) return;
                                    router.push(
                                        `/dictation/${testId}/${found.sectionId}/${found.id}`,
                                    );
                                }}
                                className={cn(
                                    'h-full w-full rounded-2xl border border-slate-100 bg-transparent shadow-none',
                                )}
                            />
                        </div>
                    </Card>

                    <div className="hidden w-[260px] flex-col gap-3 md:flex">
                        <Card className="border-0 bg-white/90 p-4 shadow-md">
                            <h3 className="text-sm font-semibold text-slate-800">
                                How this test works
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                Choose a section on the left, then pick a
                                question to start practicing dictation. You can
                                always come back here to switch sections or jump
                                to another question.
                            </p>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
