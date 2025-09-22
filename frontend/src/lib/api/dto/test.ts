import { Section } from './section';

export const skills = ['Reading', 'Listening', 'Writing', 'Speaking'];

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
    duration: number;
    number_sections: number;
    number_questions: number;
    number_participant: number;
    section: Section[];
}
