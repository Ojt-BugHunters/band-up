export interface Dictation {
    id: string;
    title: string;
    duration: number;
    difficulty: 'Easy';
    completions: number;
    createdAt: Date;
}

export interface DictationSection {
    id: string;
    testId: string;
    title: string;
    orderIndex: number;
    timeLimitSeconds: number;
    metatdata: string;
}

export interface DictationQuestion {
    id: string;
    sectionId: string;
    type: string;
    content: {
        additionalProp1: string;
        additionalProp2: string;
        additionalProp3: string;
    };
    difficult: string;
    isActive: boolean;
    uploadUrl: string;
    key: string;
    script: string;
    createdAt: Date;
}
