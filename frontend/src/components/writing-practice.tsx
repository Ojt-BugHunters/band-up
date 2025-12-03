'use client';

import { useState, useMemo, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Copy, Check, RotateCcw, Shuffle } from 'lucide-react';
import Image from 'next/image';

interface WritingPracticeProps {
    title?: string;
    taskNumber?: 1 | 2;
    prompt: string;
    notes?: string;
    imageUrl?: string;
    minWords?: number;
    initialValue?: string;
    onChangePrompt?: () => void;
}

export default function WritingPractice({
    title = 'Writing Practice',
    taskNumber = 1,
    prompt,
    notes,
    imageUrl,
    minWords = 150,
    initialValue = '',
    onChangePrompt,
}: WritingPracticeProps) {
    const [value, setValue] = useState(initialValue);
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const textRef = useRef<HTMLTextAreaElement>(null);

    const wordCount = useMemo(() => {
        return value.trim().length === 0
            ? 0
            : value
                  .trim()
                  .split(/\s+/)
                  .filter((w) => w.length > 0).length;
    }, [value]);

    const status = useMemo(() => {
        if (wordCount < minWords)
            return { label: 'Below minimum', cls: 'text-destructive' };
        if (wordCount < minWords + 50)
            return { label: 'Good', cls: 'text-warning' };
        return { label: 'Excellent', cls: 'text-success' };
    }, [wordCount, minWords]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {}
    };

    const handleClear = () => {
        setValue('');
        textRef.current?.focus();
    };

    const handleChangePrompt = () => {
        if (onChangePrompt) return onChangePrompt();
        console.info('Change prompt clicked');
    };

    return (
        <div className="relative mx-auto w-full max-w-7xl rounded-[28px] border border-white/10 bg-black/40 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.55),_0_2px_4px_rgba(255,255,255,0.06)_inset] backdrop-blur-2xl md:p-6">
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

            <div className="grid min-h-[55vh] max-w-7xl gap-4 md:grid-cols-2">
                <Card className="h-full rounded-2xl border border-white/10 bg-black/35 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-white" />
                                <CardTitle className="text-lg leading-tight text-white/95">
                                    {title}
                                </CardTitle>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleChangePrompt}
                                className="relative gap-2 rounded-xl border-white/10 bg-black/40 text-white shadow-[0_8px_25px_rgba(0,0,0,0.6),_0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl"
                            >
                                <Shuffle className="h-4 w-4" />
                                New prompt
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-white/90">
                            <div className="text-sm font-medium">Prompt:</div>
                            <p className="text-sm leading-relaxed text-white/80">
                                {prompt}
                            </p>
                            {imageUrl && (
                                <div className="pt-2">
                                    <Image
                                        width={400}
                                        height={400}
                                        src={imageUrl}
                                        alt="Task chart or illustration"
                                        className="mx-auto w-full max-w-md rounded-lg border border-white/10"
                                    />
                                </div>
                            )}
                            {notes && (
                                <div className="text-sm font-medium text-white/95">
                                    {notes}
                                </div>
                            )}
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-white/80">
                            <div className="text-xs">
                                Minimum word count:{' '}
                                <span className="font-medium text-white">
                                    {minWords}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full rounded-2xl border border-white/10 bg-black/35 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-sm text-white/85">
                                <span className="text-white/70">
                                    Word count:{' '}
                                </span>
                                <span
                                    className={`font-mono font-medium ${status.cls}`}
                                >
                                    {wordCount}
                                </span>
                                <span className="text-white/70">
                                    {' '}
                                    / {minWords} minimum
                                </span>
                                <Badge
                                    variant={
                                        wordCount >= minWords
                                            ? 'default'
                                            : 'destructive'
                                    }
                                    className="ml-2 align-middle text-[10px]"
                                >
                                    {status.label}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCopy}
                                    className="gap-2 rounded-xl border-white/10 bg-black/40 text-white shadow-[0_8px_25px_rgba(0,0,0,0.6),_0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl hover:bg-black/55"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                    {copied ? 'Copied' : 'Copy'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleClear}
                                    className="gap-2 rounded-xl border-white/10 bg-black/40 text-white shadow-[0_8px_25px_rgba(0,0,0,0.6),_0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl hover:bg-black/55"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Clear
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setExpanded((e) => !e)}
                                    className="rounded-xl border-white/10 bg-black/40 text-white shadow-[0_8px_25px_rgba(0,0,0,0.6),_0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl hover:bg-black/55"
                                >
                                    {expanded ? 'Shrink' : 'Expand'}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            ref={textRef}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={`Start writing your response for Task ${taskNumber}...`}
                            className={`w-full resize-y rounded-xl border-white/10 bg-black/30 text-sm leading-relaxed text-white/90 backdrop-blur-xl placeholder:text-white/60 ${expanded ? 'min-h-[70vh]' : 'min-h-[320px] md:min-h-[420px]'}`}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
