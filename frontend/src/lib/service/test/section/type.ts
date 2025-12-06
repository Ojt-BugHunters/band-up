export interface Section {
    id: string;
    title: string;
    questions: number;
    description: string;
}

export interface TestSection {
    id: string;
    testId: string;
    title: string;
    orderIndex: number;
    timeLimitSeconds: number;
    metadata: string;
    cloudfrontUrl: string | null;
}
