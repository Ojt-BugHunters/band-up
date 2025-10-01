export type TestType = 'reading' | 'listening' | 'writing' | 'speaking';

export interface TestCreationData {
    skillName: string;
    title: string;
    durationSeconds: number;
}

export interface Metadata {
    content: string;
    audioUrl?: string;
    image?: string;
}

export interface Passage {
    title: string;
    orderIndex: number;
    metadata: Metadata;
}
