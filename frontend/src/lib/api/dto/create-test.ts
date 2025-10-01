export type TestType = 'reading' | 'listening' | 'writing' | 'speaking';

export interface TestCreationData {
    skillName: string;
    title: string;
    durationSeconds: number;
}
