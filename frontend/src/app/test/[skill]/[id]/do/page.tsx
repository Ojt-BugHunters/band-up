import { ReadingTest } from '@/components/reading-test';
import { SpeakingTest } from '@/components/speaking-test';
import { WritingTest } from '@/components/writing-test';
import { ListeningTest } from '@/components/listening-test';

type DoTestProps = {
    searchParams: {
        mode?: string;
        skill?: string;
        section?: string | string[];
    };
};

export default function DoTestPage({ searchParams }: DoTestProps) {
    const { mode, skill, section } = searchParams;

    let sections: string[] = [];
    if (Array.isArray(section)) {
        sections = section;
    } else if (typeof section === 'string') {
        sections = section.split(',');
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
            Component = <WritingTest mode={mode} />;
            break;
        case 'speaking':
            Component = <SpeakingTest mode={mode} />;
            break;
        default:
            Component = <div>Vui lòng chọn kỹ năng hợp lệ</div>;
    }

    return <main className="bg-background min-h-screen">{Component}</main>;
}
