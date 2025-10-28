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
