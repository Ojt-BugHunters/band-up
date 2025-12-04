// TF - True false not given
// SA - Short Answer
// MC - Multiple Choice
// MF - Matching Features
// SC - Sentence Completion
// YN - Yes No Not Given
export type ReadingQuestionType =
    | 'TF'
    | 'SA'
    | 'MC'
    | 'MF'
    | 'SC'
    | 'YN'
    | 'MI';

export type ListeningQuestionType =
    | 'SA'
    | 'MC'
    | 'TB'
    | 'MP'
    | 'MT'
    | 'SC'
    | 'FC'
    | 'NC';

export type WritingQuestionType = 'task1' | 'task2';

export type SpeakingQuestionType = 'part1' | 'part23';

export interface SpeakingQuestion {
    id: number;
    question: string;
}

export interface Passage1 {
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

export type MappedQuestion = {
    sectionId: string;
    sectionIndex: number;
    difficult: number;
    type: string;
    file: File;
    script: string;
};

export type CreateDictationQuestionReq = {
    difficult: number | string;
    type: string;
    fileName: string;
    script: string;
    contentType: string;
};

export type CreateQuestionRes = {
    id: string;
    sectionId: string;
    type: string;
    difficult: number | string;
    uploadUrl: string;
    key: string;
    script: string;
    createdAt: string;
};
// -------------------------------

export interface BaseQuestion {
    id: string;
    sectionId: string;
    difficult: string;
    isActive: boolean;
    uploadUrl: string | null;
    cloudfrontUrl: string | null;
    key: string | null;
    script: string | null;
    createdAt: string | null;
}
export interface ReadingQuestion extends BaseQuestion {
    content: ReadingQuestionContent;
}

export interface ListeningQuestion extends BaseQuestion {
    content: ListeningQuestionContent;
}

export interface ReadingQuestionContent {
    type: ReadingQuestionType;
    correctAnswer: string;
    questionNumber: number;
}

export interface ListeningQuestionContent {
    type: ListeningQuestionType;
    correctAnswer: string;
    questionNumber: number;
}

export type PassageQuestion = {
    id: string;
    testId: string;
    title: string;
    orderIndex: number;
    timeLimitSeconds: number;
    metadata: string;
    cloudfrontUrl: string | null;
    questions: ReadingQuestion[];
};

export type ListeningSectionsQuestion = {
    id: string;
    testId: string;
    title: string;
    orderIndex: number;
    timeLimitSeconds: number;
    metadata: string;
    cloudfrontUrl: string | null;
    questions: ListeningQuestion[];
};
