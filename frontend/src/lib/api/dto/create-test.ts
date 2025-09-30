import {
    ListeningQuestionType,
    ReadingQuestionType,
    SpeakingQuestionType,
    WritingQuestionType,
} from './question';

export type TestType = 'reading' | 'listening' | 'writing' | 'speaking';

export type FormStep = 1 | 2 | 3;

export interface BasePassage {
    id: string;
    title: string;
    content: string;
    image?: string;
}

export interface BaseQuestion {
    id: string;
    title: string;
    content: string;
    image?: string;
}

export type ReadingPassage = BasePassage;

export interface ReadingQuestion extends BaseQuestion {
    type: ReadingQuestionType;
    passageId: string;
}

export interface ListeningPassage {
    id: string;
    audioFile: File | null;
    title: string;
}

export interface ListeningQuestion extends BaseQuestion {
    type: ListeningQuestionType;
    passageId: string;
}

export type WritingPassage = BasePassage;

export interface WritingQuestion extends BaseQuestion {
    type: WritingQuestionType;
    passageId: string;
}

export interface SpeakingSection {
    id: string;
    part: SpeakingQuestionType;
    questions: string[];
}

export interface TestCreationData {
    testType: TestType;

    readingPassages?: ReadingPassage[];
    readingQuestions?: ReadingQuestion[];

    listeningPassages?: ListeningPassage[];
    listeningQuestions?: ListeningQuestion[];

    writingPassages?: WritingPassage[];
    writingQuestions?: WritingQuestion[];

    speakingSections?: SpeakingSection[];
}

export interface FormState {
    currentStep: FormStep;
    testType: TestType | null;
    data: TestCreationData;
}
