'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { ListChecks, FolderOpen, Dot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DictationSection, DictationQuestion } from '@/lib/service/dictation';

export type SectionsPanelProps = {
    testId: string;
    sections: DictationSection[];
    className?: string;
    onSelectQuestion?: (questionId: string) => void;
};

export default function SectionsPanel({
    testId,
    sections,
    className,
    onSelectQuestion,
}: SectionsPanelProps) {
    const sorted = useMemo(
        () => [...(sections ?? [])].sort((a, b) => a.orderIndex - b.orderIndex),
        [sections],
    );

    return (
        <Card className={cn('w-full border-0 shadow-xl', className)}>
            <div className="flex items-center justify-between border-b bg-gradient-to-r from-indigo-100/70 to-blue-100/60 p-4">
                <div className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-blue-600" />
                    <h2 className="text-sm font-semibold text-slate-800">
                        Sections
                    </h2>
                </div>
                <Badge
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-700"
                >
                    {sorted.length} sections
                </Badge>
            </div>

            <ScrollArea className="max-h-[70vh] p-3">
                {sorted.length === 0 ? (
                    <Card className="flex flex-col items-center gap-2 border-2 border-dashed p-6">
                        <FolderOpen className="h-5 w-5 text-slate-500" />
                        <div className="text-sm text-slate-600">
                            No sections available
                        </div>
                    </Card>
                ) : (
                    <Accordion type="multiple" className="space-y-2">
                        {sorted.map((section) => (
                            <AccordionItem
                                key={section.id}
                                value={section.id}
                                className="rounded-xl border-2 px-2"
                            >
                                <AccordionTrigger className="gap-3 py-3 text-left hover:no-underline">
                                    <div className="flex w-full items-center justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <Badge className="h-6 rounded-full bg-slate-200 px-2 text-xs text-slate-700">
                                                    {section.orderIndex}
                                                </Badge>
                                            </div>
                                            <div className="truncate font-medium text-slate-800">
                                                {section.title}
                                            </div>
                                        </div>
                                        {/* <Badge */}
                                        {/*     variant="secondary" */}
                                        {/*     className="shrink-0 bg-indigo-100 text-indigo-700" */}
                                        {/* > */}
                                        {/*     {section.?.length ?? 0} Qs */}
                                        {/* </Badge> */}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="pb-3">
                                        {section.questions &&
                                        section.questions.length > 0 ? (
                                            <ul className="space-y-2">
                                                {section.questions.map(
                                                    (q, idx) => (
                                                        <li
                                                            key={q.id}
                                                            className="cursor-pointer rounded-lg border p-3 hover:border-teal-400 hover:bg-teal-50"
                                                            onClick={() =>
                                                                onSelectQuestion?.(
                                                                    q.id,
                                                                )
                                                            }
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="flex min-w-0 items-center gap-2">
                                                                    <Badge className="bg-teal-500 text-white">
                                                                        {idx +
                                                                            1}
                                                                    </Badge>
                                                                    <div className="truncate text-sm font-medium text-slate-800">
                                                                        {q.type}
                                                                    </div>
                                                                    <Dot className="h-4 w-4 text-slate-400" />
                                                                    <div className="truncate text-xs text-slate-500">
                                                                        {
                                                                            q.difficult
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {q.script && (
                                                                <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                                                                    {q.script}
                                                                </p>
                                                            )}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        ) : (
                                            <div className="rounded-lg border border-dashed p-3 text-sm text-slate-500">
                                                No questions
                                            </div>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </ScrollArea>

            {/* Footer */}
            <div className="border-t p-3 text-right text-xs text-slate-500">
                Test ID: <span className="font-mono">{testId}</span>
            </div>
        </Card>
    );
}
