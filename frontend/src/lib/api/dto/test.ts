export const skills = [
    'All skills',
    'Reading',
    'Listening',
    'Writing',
    'Speaking',
];

export interface Test {
    id: number;
    title: string;
    created_at: string;
    skill: string;
    number_participant: number;
    comments: number;
    duration: number;
}
