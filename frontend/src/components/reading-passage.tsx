import React, { useEffect, useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReadingPassageProps {
    title: string;
    metadata: string;
}

function tokenize(text: string) {
    const re = /(\p{L}+|\P{L}+)/gu;
    return Array.from(text.matchAll(re)).map((m) => m[0]);
}

function cleanMetadata(metadata: string): {
    passageHtml: string;
    questionsHtml: string;
} {
    try {
        const parsed = JSON.parse(metadata);
        if (parsed.htmlContent) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(parsed.htmlContent, 'text/html');

            const passageContent = doc.querySelector('.passage-content');
            const questionsContent = doc.querySelector('.questions-content');

            return {
                passageHtml: passageContent?.innerHTML || '',
                questionsHtml: questionsContent?.outerHTML || '',
            };
        }

        return { passageHtml: metadata, questionsHtml: '' };
    } catch (e) {
        console.error(e);
        return { passageHtml: metadata, questionsHtml: '' };
    }
}

export default function ReadingPassage({
    title,
    metadata,
}: ReadingPassageProps) {
    const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
    const [highlightMode, setHighlightMode] = useState(false);
    const [selecting, setSelecting] = useState(false);

    const { passageHtml, questionsHtml } = useMemo(
        () => cleanMetadata(metadata),
        [metadata],
    );

    const paragraphs = useMemo(() => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(passageHtml, 'text/html');
        const paragraphElements = doc.querySelectorAll('p');

        return Array.from(paragraphElements)
            .map((p) => p.textContent?.trim() || '')
            .filter((text) => text.length > 0);
    }, [passageHtml]);

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
        <div className="relative flex h-full flex-col">
            {/* Header */}
            <div className="m-4 ml-6 flex items-center justify-between gap-2">
                <h2 className="text-2xl font-bold text-balance">{title}</h2>

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

            {/* Nội dung passage + questions */}
            <div className="grid min-h-0 flex-1 grid-cols-2 overflow-hidden p-0">
                {/* Passage */}
                <ScrollArea className="custom-scrollbar h-full overflow-x-hidden overflow-y-auto">
                    <div className="col-span-1 space-y-4 p-6 select-none">
                        {paragraphsTokens.map((tokens, pIndex) => (
                            <p
                                key={pIndex}
                                className="mb-4 text-lg leading-relaxed text-pretty"
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
                                                if (selecting)
                                                    setSelecting(false);
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

                {/* Questions bên phải */}
                <div className="col-span-1 h-full overflow-hidden border-l p-0">
                    {questionsHtml && (
                        <ScrollArea className="custom-scrollbar h-full overflow-x-hidden overflow-y-auto">
                            <div className="space-y-4 p-6">
                                <div
                                    className="questions-section"
                                    dangerouslySetInnerHTML={{
                                        __html: questionsHtml,
                                    }}
                                />
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </div>

            {highlightMode && (
                <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-black/70 px-3 py-1 text-sm text-white">
                    Select the word to highlight — Press{' '}
                    <kbd className="ml-2 rounded bg-white/10 px-1">Esc</kbd> to
                    quit
                </div>
            )}

            <style jsx>{`
                .questions-section {
                    font-family: inherit;
                    letter-spacing: 0.02em;
                }
                .questions-section h4 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-top: 2rem;
                    margin-bottom: 1.5rem;
                    letter-spacing: 0.01em;
                }
                .questions-section p {
                    margin-bottom: 1.25rem;
                    line-height: 1.8;
                    font-size: 1.0625rem;
                    letter-spacing: 0.015em;
                }
                .questions-section strong {
                    font-weight: 700;
                }
                .questions-section em {
                    font-style: italic;
                }
                .questions-section br {
                    display: block;
                    content: '';
                    margin-top: 0.75rem;
                }
                .questions-section .passage-content p {
                    margin-bottom: 1rem;
                    margin-top: 0.75rem;
                }
                .questions-section > * + * {
                    margin-top: 1.25rem;
                }
            `}</style>
        </div>
    );
}
