export type ReadingQuestionType =
    | 'multiple-choice'
    | 'short-answer'
    | 'true-false'
    | 'completion';

export type ListeningQuestionType =
    | 'multiple-choice'
    | 'completion'
    | 'true-false';

export type WritingQuestionType = 'task1' | 'task2';

export type SpeakingQuestionType = 'part1' | 'part23';
export interface ReadingQuestion {
    id: number;
    type: ReadingQuestionType;
    question: string;
    options?: string[];
    image?: string;
}

export interface ListeningQuestion {
    id: number;
    type: ListeningQuestionType;
    question: string;
    options?: string[];
    image?: string;
}

export interface SpeakingQuestion {
    id: number;
    question: string;
}

export interface Passage {
    id: string;
    title: string;
    content: string;
    questions: ReadingQuestion[];
}

export interface WritingTask {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
}

export interface ListeningSection {
    id: string;
    title: string;
    audioUrl: string;
    duration: number;
    questions: ListeningQuestion[];
}

export interface SpeakingSection {
    id: string;
    title: string;
    duration: number;
    description: string;
    questions: SpeakingQuestion[];
}

export interface EnrichedSpeakingQuestion extends SpeakingQuestion {
    preparationTime: number;
    speakingTime: number;
}

export interface EnrichedSpeakingSection extends SpeakingSection {
    questions: EnrichedSpeakingQuestion[];
}

export function enrichSpeakingTestParts(
    sections: SpeakingSection[],
): EnrichedSpeakingSection[] {
    return sections.map((section) => {
        let preparationTime = 0;
        let speakingTime = 90;

        if (section.id === 'section-2') {
            preparationTime = 60;
            speakingTime = 120;
        }

        return {
            ...section,
            questions: section.questions.map((q) => ({
                ...q,
                preparationTime,
                speakingTime,
            })),
        };
    });
}
