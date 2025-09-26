'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, RotateCcw, Copy, Check, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface WritingEditorProps {
    taskNumber: 1 | 2;
    title: string;
    content: string;
    instructions: string;
    minWords: number;
    value: string;
    onChange: (value: string) => void;
    imageUrl?: string;
    layout?: 'full' | 'split';
    showInstructions?: boolean;
}

export default function WritingEditor({
    taskNumber,
    title,
    content,
    instructions,
    minWords,
    value,
    onChange,
    imageUrl,
    layout = 'full',
    showInstructions = true,
}: WritingEditorProps) {
    const [wordCount, setWordCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const words = value
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0);
        setWordCount(words.length);
    }, [value]);

    const handleClear = () => {
        onChange('');
        textareaRef.current?.focus();
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Fail to copy text to clip board');
        }
    };

    const getWordCountStatus = () => {
        if (wordCount < minWords) {
            return { color: 'text-destructive', status: 'Below minimum' };
        } else if (wordCount >= minWords && wordCount < minWords + 50) {
            return { color: 'text-warning', status: 'Good' };
        } else {
            return { color: 'text-success', status: 'Excellent' };
        }
    };

    const wordCountStatus = getWordCountStatus();

    if (layout === 'split' && showInstructions) {
        return (
            <Card className="h-full">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <BookOpen className="text-primary h-5 w-5" />
                        <CardTitle className="text-lg text-balance">
                            Task Instructions
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                            Task {taskNumber}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="h-[calc(100%-80px)] space-y-4 overflow-y-auto">
                    <div className="bg-muted/50 space-y-3 rounded-lg p-4">
                        <div className="text-foreground text-sm font-medium">
                            Instructions:
                        </div>
                        <div className="text-muted-foreground text-sm leading-relaxed">
                            {instructions}
                        </div>

                        {imageUrl && (
                            <div className="mt-4">
                                <Image
                                    width={400}
                                    height={400}
                                    src={imageUrl || '/placeholder.svg'}
                                    alt="Task diagram or chart"
                                    className="mx-auto w-full max-w-md rounded-lg border"
                                />
                            </div>
                        )}

                        <div className="text-primary text-sm font-medium">
                            {content}
                        </div>
                    </div>

                    <div className="bg-background space-y-2 rounded-lg border p-4">
                        <div className="text-foreground text-sm font-medium">
                            Writing Tips:
                        </div>
                        <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                            <li>Plan your response before writing</li>
                            <li>Use clear paragraphs and logical structure</li>
                            <li>Check your word count regularly</li>
                            <li>Leave time for proofreading</li>
                        </ul>
                    </div>

                    <div className="bg-primary/10 border-primary/20 rounded-lg border p-3">
                        <div className="text-primary text-sm font-medium">
                            Minimum word count: {minWords} words
                        </div>
                        <div className="text-muted-foreground mt-1 text-xs">
                            Responses below the minimum word count will be
                            penalized
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (layout === 'split' && !showInstructions) {
        return (
            <Card className="h-full">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="text-primary h-5 w-5" />
                            <CardTitle className="text-lg text-balance">
                                {title}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs">
                                Task {taskNumber}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopy}
                                className="gap-2 bg-transparent"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                                {copied ? 'Copied' : 'Copy'}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClear}
                                className="gap-2 bg-transparent"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Clear
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="h-[calc(100%-120px)] space-y-4">
                    <div className="bg-background flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-4">
                            <div className="text-sm">
                                <span className="text-muted-foreground">
                                    Word count:{' '}
                                </span>
                                <span
                                    className={`font-mono font-medium ${wordCountStatus.color}`}
                                >
                                    {wordCount}
                                </span>
                                <span className="text-muted-foreground">
                                    {' '}
                                    / {minWords} minimum
                                </span>
                            </div>
                            <Badge
                                variant={
                                    wordCount >= minWords
                                        ? 'default'
                                        : 'destructive'
                                }
                                className="text-xs"
                            >
                                {wordCountStatus.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="h-[calc(100%-80px)] flex-1">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={`Start writing your response for Task ${taskNumber}...`}
                            className="h-full resize-none text-sm leading-relaxed"
                        />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="text-primary h-5 w-5" />
                        <CardTitle className="text-lg text-balance">
                            {title}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                            Task {taskNumber}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="gap-2 bg-transparent"
                        >
                            {copied ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                            {copied ? 'Copied' : 'Copy'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                            className="gap-2 bg-transparent"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Clear
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="h-[calc(100%-120px)] space-y-4">
                <div className="bg-muted/50 space-y-3 rounded-lg p-4">
                    <div className="text-foreground text-sm font-medium">
                        Instructions:
                    </div>
                    <div className="text-muted-foreground text-sm leading-relaxed">
                        {instructions}
                    </div>

                    {imageUrl && (
                        <div className="mt-4">
                            <Image
                                width={400}
                                height={400}
                                src={imageUrl || '/placeholder.svg'}
                                alt="Task diagram or chart"
                                className="mx-auto w-full max-w-md rounded-lg border"
                            />
                        </div>
                    )}

                    <div className="text-primary text-sm font-medium">
                        {content}
                    </div>
                </div>

                <div className="bg-background flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            <span className="text-muted-foreground">
                                Word count:{' '}
                            </span>
                            <span
                                className={`font-mono font-medium ${wordCountStatus.color}`}
                            >
                                {wordCount}
                            </span>
                            <span className="text-muted-foreground">
                                {' '}
                                / {minWords} minimum
                            </span>
                        </div>
                        <Badge
                            variant={
                                wordCount >= minWords
                                    ? 'default'
                                    : 'destructive'
                            }
                            className="text-xs"
                        >
                            {wordCountStatus.status}
                        </Badge>
                    </div>
                </div>

                <div className="flex-1">
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={`Start writing your response for Task ${taskNumber}...`}
                        className="min-h-[400px] resize-none text-sm leading-relaxed"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
