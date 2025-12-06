import { ReadingTest } from './reading-test';
import { SpeakingTest } from '@/components/speaking-test';
import { WritingTest } from '@/components/writing-test';
import { ListeningTest } from '@/components/listening-test';
import { NotFound } from '@/components/not-found';

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
        const rawSections = section.split(',');

        for (const sec of rawSections) {
            if (sec.includes('-')) {
                const parts = sec.split('-');
                const prefix = parts[0];
                const nums = parts.slice(1);

                if (nums.every((n) => /^\d+$/.test(n))) {
                    nums.forEach((n) => sections.push(`${prefix}-${n}`));
                } else {
                    sections.push(sec);
                }
            } else {
                sections.push(sec);
            }
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
            Component = <NotFound />;
    }

    return <main className="bg-background min-h-screen">{Component}</main>;
}
