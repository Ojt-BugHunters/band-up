'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { DictationAudio, Section } from '@/lib/api/dto/dictation';
import { cn } from '@/lib/utils';
import { Headphones, ChevronRight } from 'lucide-react';
import { useState } from 'react';

type DictationSidebarProps = {
    sections: Section[];
    selectedAudio: DictationAudio;
    onSelectAudio: (audio: DictationAudio) => void;
};

export function DictationSidebar({
    sections,
    selectedAudio,
    onSelectAudio,
}: DictationSidebarProps) {
    const [expandedSections, setExpandedSections] = useState<string[]>([
        sections[0].id,
    ]);

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId],
        );
    };

    return (
        <aside className="border-sidebar-border bg-sidebar flex w-80 flex-col border-r">
            <div className="border-sidebar-border border-b p-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
                        <Headphones className="text-primary-foreground h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-sidebar-foreground text-lg font-semibold">
                            IELTS Listening
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Dictation Practice
                        </p>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="space-y-2 p-4">
                    {sections.map((section) => {
                        const isExpanded = expandedSections.includes(
                            section.id,
                        );
                        return (
                            <div key={section.id} className="space-y-1">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="hover:bg-sidebar-accent group flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors"
                                >
                                    <span className="text-sidebar-foreground text-sm font-medium">
                                        {section.title}
                                    </span>
                                    <ChevronRight
                                        className={cn(
                                            'text-muted-foreground h-4 w-4 transition-transform',
                                            isExpanded && 'rotate-90',
                                        )}
                                    />
                                </button>

                                {isExpanded && (
                                    <div className="ml-2 space-y-1">
                                        {section.audioFiles.map((audio) => {
                                            const isSelected =
                                                selectedAudio.id === audio.id;
                                            return (
                                                <button
                                                    key={audio.id}
                                                    onClick={() =>
                                                        onSelectAudio(audio)
                                                    }
                                                    className={cn(
                                                        'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
                                                        isSelected
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'hover:bg-sidebar-accent text-sidebar-foreground',
                                                    )}
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className={cn(
                                                                'truncate text-sm font-medium',
                                                                isSelected &&
                                                                    'text-primary-foreground',
                                                            )}
                                                        >
                                                            {audio.title}
                                                        </p>
                                                        <p
                                                            className={cn(
                                                                'mt-0.5 text-xs',
                                                                isSelected
                                                                    ? 'text-primary-foreground/80'
                                                                    : 'text-muted-foreground',
                                                            )}
                                                        >
                                                            {audio.duration}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            <div className="border-sidebar-border border-t p-4">
                <div className="text-muted-foreground text-center text-xs">
                    Practice makes perfect
                </div>
            </div>
        </aside>
    );
}
