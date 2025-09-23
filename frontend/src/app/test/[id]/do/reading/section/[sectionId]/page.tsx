'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock } from 'lucide-react';
import { useState } from 'react';

export default function ReadingSectionPage() {
    const [currentSection, setCurrentSection] = useState(1);
    const [timeRemaining, setTimeRemaining] = useState(3600);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    return (
        <div className="bg-background mt-16 flex h-screen flex-1 space-y-6 p-6">
            <div className="border-border flex flex-1 flex-col border-r">
                <div className="border-border bg-card flex items-center justify-between border-b p-4">
                    <div className="flex items-center gap-3">
                        <BookOpen className="text-primary h-5 w-5" />
                        <h1 className="font-semibold">IELTS Reading Test</h1>
                        <Badge variant="secondary">
                            Section {currentSection}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            <span className="font-mono text-lg">
                                {formatTime(timeRemaining)}
                            </span>
                        </div>
                        <Button variant="destructive" size="sm">
                            End Test
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
