export type ReadingQuestionType =
    | 'multiple-choice'
    | 'short-answer'
    | 'true-false'
    | 'completion';

export type ListeningQuestionType = 'multiple-choice' | 'completion';

export interface ReadingQuestion {
    id: number;
    type: ReadingQuestionType;
    question: string;
    options?: string[];
    answer: string;
    image?: string;
}

export interface ListeningQuestion {
    id: number;
    type: ListeningQuestionType;
    question: string;
    option?: string[];
    image?: string;
}

export interface Passage {
    id: string;
    title: string;
    content: string;
    questions: ReadingQuestion[];
}

export interface ListeningSection {
    id: string;
    title: string;
    audioUrl: string;
    duration: number;
    question: ListeningQuestion[];
}
