'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReadingPassageProps {
    title: string;
    content: string;
}

function tokenize(text: string) {
    const re = /(\p{L}+|\P{L}+)/gu;
    return Array.from(text.matchAll(re)).map((m) => m[0]);
}

export default function ReadingPassage({
    title,
    content,
}: ReadingPassageProps) {
    const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
    const [highlightMode, setHighlightMode] = useState(false);
    const [selecting, setSelecting] = useState(false);

    const paragraphs = useMemo(() => content.split('\n\n'), [content]);
    const paragraphsTokens = useMemo(
        () => paragraphs.map((p) => tokenize(p)),
        [paragraphs],
    );

    const toggleToken = (id: string) => {
        setHighlighted((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setHighlightMode(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const isWordToken = (token: string) => /\p{L}/u.test(token);

    return (
        <div className="relative h-full">
            <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="mb-2 text-2xl font-bold text-balance">
                    {title}
                </h2>

                <button
                    type="button"
                    onClick={() => setHighlightMode((s) => !s)}
                    aria-pressed={highlightMode}
                    className={`rounded-md border px-3 py-1 ${
                        highlightMode
                            ? 'border-yellow-500 bg-yellow-300/80'
                            : 'bg-white/80 hover:bg-gray-50'
                    }`}
                >
                    {highlightMode ? 'Highlight: ON' : 'Highlighter'}
                </button>
            </div>

            <ScrollArea className="custom-scrollbar h-[calc(100%-60px)]">
                <div className="space-y-4 pr-4 select-none">
                    {paragraphsTokens.map((tokens, pIndex) => (
                        <p
                            key={pIndex}
                            className="text-lg leading-relaxed text-pretty"
                        >
                            {tokens.map((token, tIndex) => {
                                const id = `${pIndex}-${tIndex}`;
                                const isWord = isWordToken(token);
                                const isHighlighted = highlighted.has(id);

                                return (
                                    <span
                                        key={id}
                                        onMouseDown={(e) => {
                                            if (!highlightMode || !isWord)
                                                return;
                                            setSelecting(true);
                                            toggleToken(id);
                                            e.preventDefault();
                                        }}
                                        onMouseEnter={() => {
                                            if (
                                                !highlightMode ||
                                                !selecting ||
                                                !isWord
                                            )
                                                return;
                                            toggleToken(id);
                                        }}
                                        onMouseUp={() => {
                                            if (selecting) setSelecting(false);
                                        }}
                                        className={`inline ${
                                            isWord && highlightMode
                                                ? 'cursor-pointer'
                                                : ''
                                        } ${
                                            isHighlighted
                                                ? 'rounded bg-yellow-300 px-[2px]'
                                                : ''
                                        }`}
                                    >
                                        {token}
                                    </span>
                                );
                            })}
                        </p>
                    ))}
                </div>
            </ScrollArea>

            {highlightMode && (
                <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-black/70 px-3 py-1 text-sm text-white">
                    Select the word to highlight — Press{' '}
                    <kbd className="ml-2 rounded bg-white/10 px-1">Esc</kbd> to
                    quit
                </div>
            )}
        </div>
    );
}
