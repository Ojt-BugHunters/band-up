'use client';

import { ReactNode, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mic, FileText, Shuffle } from 'lucide-react';

interface SpeakingPracticeProps {
    title?: string;
    partLabel?: string;
    questions: string[];
    notes?: string;
    voiceInputSlot?: ReactNode;
    fileUploadSlot?: ReactNode;
    onChangePrompt?: () => void;
    maxWidth?: string;
    minHeightVH?: number;
}

export default function SpeakingPractice({
    title = 'IELTS Speaking',
    partLabel = 'Part',
    questions,
    notes,
    voiceInputSlot,
    fileUploadSlot,
    onChangePrompt,
    maxWidth = 'max-w-7xl',
    minHeightVH = 60,
}: SpeakingPracticeProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className={[
                'relative mx-auto w-full rounded-[28px] border border-white/10 bg-black/40 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.55),_0_2px_4px_rgba(255,255,255,0.06)_inset] backdrop-blur-2xl md:p-6',
                maxWidth,
            ].join(' ')}
            style={{ minHeight: `${minHeightVH}vh` }}
        >
            <div
                className="pointer-events-none absolute -inset-6 -z-10 opacity-40 blur-3xl"
                aria-hidden
                style={{
                    background:
                        'radial-gradient(1200px 600px at 20% 10%, rgba(255,255,255,.12), transparent 60%), radial-gradient(800px 500px at 80% 0%, rgba(255,255,255,.06), transparent 60%)',
                }}
            />
            <div
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-40"
                aria-hidden
                style={{
                    background:
                        'linear-gradient(to bottom, rgba(255,255,255,.22), rgba(255,255,255,.06) 40%, transparent 75%)',
                    maskImage:
                        'radial-gradient(120% 120% at 0% 0%, black 35%, transparent 60%)',
                }}
            />

            <div className="grid h-full gap-8 md:grid-cols-2">
                <Card className="h-full rounded-2xl border border-white/10 bg-black/35 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-white" />
                                <CardTitle className="text-lg leading-tight text-white/95">
                                    {title}
                                </CardTitle>
                                <Badge
                                    variant="outline"
                                    className="text-xs text-white/80"
                                >
                                    {partLabel}
                                </Badge>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onChangePrompt}
                                className="relative gap-2 rounded-xl border-white/10 bg-black/40 text-white shadow-[0_8px_25px_rgba(0,0,0,0.6),_0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl hover:bg-black/55"
                            >
                                <Shuffle className="h-4 w-4" />
                                New prompt
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-white/90">
                            <div className="text-sm font-medium">
                                Questions:
                            </div>
                            <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-white/80">
                                {questions.map((q, i) => (
                                    <li key={i}>
                                        <span className="text-white/70">
                                            Q{i + 1}:
                                        </span>{' '}
                                        {q}
                                    </li>
                                ))}
                            </ul>
                            {notes && (
                                <div className="text-sm font-medium text-white/95">
                                    {notes}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full rounded-2xl border border-white/10 bg-black/35 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white/85">
                                <Mic className="h-5 w-5" />
                                <span className="text-sm">Respond</span>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setExpanded((e) => !e)}
                                className="rounded-xl border-white/10 bg-black/40 text-white shadow-[0_8px_25px_rgba(0,0,0,0.6),_0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl hover:bg-black/55"
                            >
                                {expanded ? 'Shrink' : 'Expand'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div
                            className={`rounded-xl border border-white/10 bg-black/30 p-4 text-white/80 backdrop-blur-xl ${expanded ? 'min-h-[34vh]' : 'min-h-[240px]'}`}
                        >
                            {voiceInputSlot ? (
                                voiceInputSlot
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-white/70">
                                    Voice input placeholder
                                </div>
                            )}
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-white/80 backdrop-blur-xl">
                            {fileUploadSlot ? (
                                fileUploadSlot
                            ) : (
                                <div className="flex h-40 items-center justify-center text-sm text-white/70">
                                    File upload placeholder
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
