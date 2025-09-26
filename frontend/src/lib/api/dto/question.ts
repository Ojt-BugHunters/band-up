export type ReadingQuestionType =
    | 'multiple-choice'
    | 'short-answer'
    | 'true-false'
    | 'completion';

export type ListeningQuestionType =
    | 'multiple-choice'
    | 'completion'
    | 'true-false';

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
