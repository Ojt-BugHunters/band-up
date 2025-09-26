import { ReadingTest } from '@/components/reading-test';
import { SpeakingTest } from '@/components/speaking-test';
import { WritingTest } from '@/components/writing-test';
import { ListeningTest } from '@/components/listening-test';

type DoTestProps = {
    searchParams: Promise<{
        mode?: string;
        skill?: string;
        section?: string | string[];
    }>;
};

export default async function DoTestPage({ searchParams }: DoTestProps) {
    const { mode, skill, section } = await searchParams;

    let sections: string[] = [];
    if (Array.isArray(section)) {
        sections = section;
    } else if (typeof section === 'string') {
        if (section.includes('-') && !section.includes(',')) {
            const parts = section.split('-');
            const prefix = parts[0];
            const nums = parts.slice(1);
            sections = nums.map((n) => `${prefix}-${n}`);
        } else {
            sections = section.split(',');
        }
    }

    let Component: React.ReactNode = null;
    switch (skill) {
        case 'reading':
            Component = <ReadingTest mode={mode} sections={sections} />;
            break;
        case 'listening':
            Component = <ListeningTest mode={mode} sections={sections} />;
            break;
        case 'writing':
            Component = <WritingTest mode={mode} sections={sections} />;
            break;
        case 'speaking':
            Component = <SpeakingTest mode={mode} sections={sections} />;
            break;
        default:
            Component = <div>Unavaible Test</div>;
    }

    return <main className="bg-background min-h-screen">{Component}</main>;
}
