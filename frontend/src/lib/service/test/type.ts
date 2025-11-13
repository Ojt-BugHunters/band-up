import { Section } from './section/type';

export const skills = ['Reading', 'Listening', 'Writing', 'Speaking'];

export type Skill = (typeof skills)[number];

export type TestType = 'reading' | 'listening' | 'writing' | 'speaking';

export type TestHistory = {
    id: string;
    skill: 'Listening' | 'Reading' | 'Writing' | 'Speaking';
    date: string;
    duration: string;
    overallScore: number;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    questions?: Array<{
        questionNumber: number;
        isCorrect: boolean;
        userAnswer?: string;
        correctAnswer?: string;
        section: string;
    }>;
    sectionScores: Array<{
        section: string;
        score: number;
        maxScore: number;
    }>;
    timeSpent: Array<{
        section: string;
        minutes: number;
    }>;
    difficultyBreakdown: Array<{
        level: string;
        correct: number;
        total: number;
    }>;
};
export interface TestOverview {
    id: string;
    title: string;
    created_at: string;
    skill: string;
    number_participant: number;
    comments: number;
    duration: number;
}

export interface Test {
    id: string;
    title: string;
    skill: Skill;
    duration: number;
    number_sections: number;
    number_questions: number;
    number_participant: number;
    section: Section[];
}
