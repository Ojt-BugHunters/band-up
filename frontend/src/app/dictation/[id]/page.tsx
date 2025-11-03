import { DictationAudio } from '@/lib/api/dto/dictation';
import { useState } from 'react';
import { sections } from '../../../../constants/sample-data';

export default function DictationDetail() {
    const [selectedAudio, setSelectedAudio] = useState<DictationAudio>(
        sections[0].audioFiles[0],
    );
    return (
        <div className="bg-background flex h-screen">
            <h1>Hello</h1>
        </div>
    );
}
