'use client';
import { DictationAudio } from '@/lib/api/dto/dictation';
import { useState } from 'react';
import { sections } from '../../../../constants/sample-data';
import { DictationSidebar } from '@/components/dictation-sidebar';
import { DictationContent } from '@/components/dictation-content';

export default function DictationDetail() {
    const [selectedAudio, setSelectedAudio] = useState<DictationAudio>(
        sections[0].audioFiles[0],
    );
    return (
        <div className="bg-background flex h-screen">
            <DictationSidebar
                sections={sections}
                selectedAudio={selectedAudio}
                onSelectAudio={setSelectedAudio}
            />
            <DictationContent selectedAudio={selectedAudio} />
        </div>
    );
}
