export type CreateAttemptResponse = {
    id: string;
    userId: string;
    testId: string;
    startAt: string;
    submitAt: string | null;
    status: string;
    score: number | null;
    overallBand: number | null;
    attemptSections: string[];
};
