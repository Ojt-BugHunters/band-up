export type Flashcard = {
    id: string;
    title: string;
    term: string;
    definition: string;
    skill: string;
    created_at: string;
};

export const skills = [
    'Reading',
    'Listening',
    'Speaking',
    'Writing',
    'Vocabulary',
    'Grammar',
];
